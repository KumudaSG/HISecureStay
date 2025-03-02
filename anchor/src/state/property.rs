use anchor_lang::prelude::*;

#[account]
pub struct Property {
    pub owner: Pubkey,
    pub property_id: u64,
    pub name: String,
    pub description: String,
    pub price_per_day: u64,
    pub min_duration: u8,
    pub max_duration: u8,
    pub smart_lock_id: [u8; 32],
    pub is_available: bool,
    pub current_tenant: Option<Pubkey>,
    pub rental_start_time: Option<i64>,
    pub rental_end_time: Option<i64>,
    pub bump: u8,
}

impl Property {
    pub const LEN: usize = 8 + // discriminator
        32 + // owner: Pubkey
        8 + // property_id: u64
        4 + 50 + // name: String (max 50 chars)
        4 + 200 + // description: String (max 200 chars)
        8 + // price_per_day: u64
        1 + // min_duration: u8
        1 + // max_duration: u8
        32 + // smart_lock_id: [u8; 32]
        1 + // is_available: bool
        1 + 32 + // current_tenant: Option<Pubkey>
        1 + 8 + // rental_start_time: Option<i64>
        1 + 8 + // rental_end_time: Option<i64>
        1; // bump: u8
}
