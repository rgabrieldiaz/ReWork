export const SUPER_ADMIN_EMAILS = [
    'gabrieldiaz81@gmail.com',
    'mail.de.celular.2017@gmail.com'
];

export const SUPER_ADMIN_WALLETS = [
    'GDWVAT3G6VUCW325JDN47S7YKILQGIMHXDBUBSFTY4EAOMCA2PO6LWNA',
    'GBFLXZGCXENXVN3RVRWUKV3OPQZACF7AROTWCSTNK3CTJZNKFMC4N76A',
    'GBPBF5WOXFDXV4HSHEVHRKGJPHTKM2H3HHOOQXBVGN6U2UOZUAEXCMPU'
];

export function isSuperAdmin(email?: string | null, wallet?: string | null, role?: string | null): boolean {
    if (role && role.toLowerCase() === 'admin') return true;
    if (email && SUPER_ADMIN_EMAILS.some(e => e.toLowerCase() === email.toLowerCase().trim())) return true;
    if (wallet && SUPER_ADMIN_WALLETS.some(w => w.toLowerCase() === wallet.toLowerCase().trim())) return true;
    return false;
}
