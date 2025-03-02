use anchor_lang::prelude::*;

#[account]
pub struct SmartLock {
    pub owner: Pubkey,
    pub lock_id: [u8; 32],
    pub name: String,
    pub is_registered: bool,
    pub is_locked: bool,
    pub authorized_users: Vec<Pubkey>,
    pub bump: u8,
}

impl SmartLock {
    pub const LEN: usize = 8 + // discriminator
        32 + // owner: Pubkey
        32 + // lock_id: [u8; 32]
        4 + 50 + // name: String (max 50 chars)
        1 + // is_registered: bool
        1 + // is_locked: bool
        4 + (10 * 32) + // authorized_users: Vec<Pubkey> (max 10 users)
        1; // bump: u8
}
