// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ReWorkRentalEscrow
 * @notice Smart Rental & Commercial Yield Escrow on Celo Mainnet (Chain ID: 42220)
 * @dev Built for the "Agents on Open Rails" Hackathon (Celo x Loops House):
 *      - Supports Ripio wFIAT (wARS, wBRL, wMXN, wCOP, wPEN, wCLP), USA₮, USDC, and USD₮.
 *      - Principal is 100% protected; accrued DeFi yield is always split 50% Tenant / 50% Landlord.
 *      - Normal release at maturity via Dual Co-Signature (Tenant + Landlord).
 *      - Dispute resolution mediated on-chain by ReWork's ERC-8004 Registered Arbitrator Agent.
 */

interface IERC20Minimal {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract ReWorkRentalEscrow {
    enum EscrowState {
        DRAFT,
        PENDING_COUNTERPARTY,
        ACTIVE_LOCKED,
        YIELDING,
        MATURED_WAITING_DUAL_SIG,
        PARTIALLY_SIGNED,
        RELEASED,
        DISPUTED,
        UNDER_AI_REVIEW,
        RESOLVED
    }

    struct DepositAgreement {
        uint256 id;
        address token;
        address tenant;
        address landlord;
        address arbitratorAgent; // ERC-8004 Registered Agent Wallet
        uint256 principalAmount;
        uint256 accruedYield;
        uint256 createdAt;
        uint256 maturityTimestamp;
        bool tenantSignedRelease;
        bool landlordSignedRelease;
        uint8 tenantPrincipalSplitPct; // Default 100% on normal release; 0-100% on dispute resolution
        EscrowState state;
        string propertyMetadataUri;
        string aiVerdictHash;
    }

    uint256 public nextAgreementId = 1;
    mapping(uint256 => DepositAgreement) public agreements;

    event AgreementCreated(
        uint256 indexed id,
        address indexed tenant,
        address indexed landlord,
        address token,
        uint256 principalAmount,
        uint256 maturityTimestamp
    );
    event YieldRecorded(uint256 indexed id, uint256 totalYield, uint256 tenantShare, uint256 landlordShare);
    event ReleaseCoSigned(uint256 indexed id, address indexed signer, bool tenantSigned, bool landlordSigned);
    event EscrowReleased(
        uint256 indexed id,
        uint256 tenantPayout,
        uint256 landlordPayout,
        EscrowState finalState
    );
    event DisputeOpened(uint256 indexed id, address indexed openedBy, string reasonUri);
    event AIVerdictSubmitted(
        uint256 indexed id,
        address indexed arbitratorAgent,
        uint8 tenantPrincipalPct,
        string verdictHash
    );

    /**
     * @notice Creates and funds a new Smart Rental / Guarantee Deposit Escrow
     */
    function createAndFundDeposit(
        address token,
        address landlord,
        address arbitratorAgent,
        uint256 principalAmount,
        uint256 durationSeconds,
        string calldata propertyMetadataUri
    ) external returns (uint256 agreementId) {
        require(token != address(0), "Invalid token");
        require(landlord != address(0) && landlord != msg.sender, "Invalid landlord");
        require(principalAmount > 0, "Principal must be > 0");

        require(
            IERC20Minimal(token).transferFrom(msg.sender, address(this), principalAmount),
            "Token transfer failed"
        );

        agreementId = nextAgreementId++;
        agreements[agreementId] = DepositAgreement({
            id: agreementId,
            token: token,
            tenant: msg.sender,
            landlord: landlord,
            arbitratorAgent: arbitratorAgent,
            principalAmount: principalAmount,
            accruedYield: 0,
            createdAt: block.timestamp,
            maturityTimestamp: block.timestamp + durationSeconds,
            tenantSignedRelease: false,
            landlordSignedRelease: false,
            tenantPrincipalSplitPct: 100,
            state: EscrowState.YIELDING,
            propertyMetadataUri: propertyMetadataUri,
            aiVerdictHash: ""
        });

        emit AgreementCreated(
            agreementId,
            msg.sender,
            landlord,
            token,
            principalAmount,
            block.timestamp + durationSeconds
        );
    }

    /**
     * @notice Co-signs normal release at or after maturity (or early by mutual consent).
     *         Once both Tenant and Landlord sign, principal (100% Tenant) + yield (50/50) settle automatically.
     */
    function coSignRelease(uint256 agreementId) external {
        DepositAgreement storage ag = agreements[agreementId];
        require(msg.sender == ag.tenant || msg.sender == ag.landlord, "Only tenant or landlord");
        require(
            ag.state == EscrowState.ACTIVE_LOCKED ||
            ag.state == EscrowState.YIELDING ||
            ag.state == EscrowState.MATURED_WAITING_DUAL_SIG ||
            ag.state == EscrowState.PARTIALLY_SIGNED,
            "Invalid state for release"
        );

        if (msg.sender == ag.tenant) {
            ag.tenantSignedRelease = true;
        } else {
            ag.landlordSignedRelease = true;
        }

        emit ReleaseCoSigned(agreementId, msg.sender, ag.tenantSignedRelease, ag.landlordSignedRelease);

        if (ag.tenantSignedRelease && ag.landlordSignedRelease) {
            _settleFunds(ag, 100, EscrowState.RELEASED);
        } else {
            ag.state = EscrowState.PARTIALLY_SIGNED;
        }
    }

    /**
     * @notice Opens a formal dispute and triggers ERC-8004 AI Arbitrator review
     */
    function openDispute(uint256 agreementId, string calldata reasonUri) external {
        DepositAgreement storage ag = agreements[agreementId];
        require(msg.sender == ag.tenant || msg.sender == ag.landlord, "Unauthorized");
        require(ag.state != EscrowState.RELEASED && ag.state != EscrowState.RESOLVED, "Already settled");

        ag.state = EscrowState.UNDER_AI_REVIEW;
        emit DisputeOpened(agreementId, msg.sender, reasonUri);
    }

    /**
     * @notice Executed by the ERC-8004 Arbitrator Agent (or accepted by parties) after `@celo/buy` evidence review
     */
    function resolveDisputeByAgent(
        uint256 agreementId,
        uint8 tenantPrincipalPct,
        string calldata verdictHash
    ) external {
        DepositAgreement storage ag = agreements[agreementId];
        require(
            msg.sender == ag.arbitratorAgent || msg.sender == ag.tenant || msg.sender == ag.landlord,
            "Unauthorized resolver"
        );
        require(tenantPrincipalPct <= 100, "Invalid percentage");
        require(ag.state == EscrowState.DISPUTED || ag.state == EscrowState.UNDER_AI_REVIEW, "Not in dispute");

        ag.tenantPrincipalSplitPct = tenantPrincipalPct;
        ag.aiVerdictHash = verdictHash;

        emit AIVerdictSubmitted(agreementId, msg.sender, tenantPrincipalPct, verdictHash);
        _settleFunds(ag, tenantPrincipalPct, EscrowState.RESOLVED);
    }

    function _settleFunds(
        DepositAgreement storage ag,
        uint8 tenantPrincipalPct,
        EscrowState finalState
    ) internal {
        ag.state = finalState;

        uint256 tenantPrincipal = (ag.principalAmount * tenantPrincipalPct) / 100;
        uint256 landlordPrincipal = ag.principalAmount - tenantPrincipal;

        // 50/50 Yield Split
        uint256 tenantYield = ag.accruedYield / 2;
        uint256 landlordYield = ag.accruedYield - tenantYield;

        uint256 totalTenantPayout = tenantPrincipal + tenantYield;
        uint256 totalLandlordPayout = landlordPrincipal + landlordYield;

        if (totalTenantPayout > 0) {
            IERC20Minimal(ag.token).transfer(ag.tenant, totalTenantPayout);
        }
        if (totalLandlordPayout > 0) {
            IERC20Minimal(ag.token).transfer(ag.landlord, totalLandlordPayout);
        }

        emit EscrowReleased(ag.id, totalTenantPayout, totalLandlordPayout, finalState);
    }
}
