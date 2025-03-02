use anchor_lang::prelude::*;
use crate::state::property::*;
use crate::state::smart_lock::*;
use crate::error::ErrorCode;

#[derive(Accounts)]
#[instruction(property_data: PropertyData)]
pub struct ListProperty<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    
    #[account(
        init,
        payer = owner,
        space = Property::LEN,
        seeds = [b"property", owner.key().as_ref(), &property_data.property_id.to_le_bytes()],
        bump
    )]
    pub property: Account<'info, Property>,
    
    #[account(
        constraint = smart_lock.owner == owner.key() @ ErrorCode::InvalidSmartLockOwner,
        constraint = smart_lock.is_registered @ ErrorCode::SmartLockNotRegistered,
    )]
    pub smart_lock: Account<'info, SmartLock>,
    
    pub system_program: Program<'info, System>,
}

pub fn handle_list_property(
    ctx: Context<ListProperty>,
    property_data: PropertyData,
) -> Result<()> {
    let property = &mut ctx.accounts.property;
    let owner = &ctx.accounts.owner;
    let smart_lock = &ctx.accounts.smart_lock;
    
    // Set property data
    property.owner = owner.key();
    property.property_id = property_data.property_id;
    property.name = property_data.name;
    property.description = property_data.description;
    property.price_per_day = property_data.price_per_day;
    property.min_duration = property_data.min_duration;
    property.max_duration = property_data.max_duration;
    property.smart_lock_id = smart_lock.lock_id;
    property.is_available = true;
    property.current_tenant = None;
    property.rental_start_time = None;
    property.rental_end_time = None;
    property.bump = *ctx.bumps.get("property").unwrap();
    
    // Emit property listed event
    emit!(PropertyListed {
        property_id: property.property_id,
        owner: property.owner,
        price_per_day: property.price_per_day,
        smart_lock_id: property.smart_lock_id,
    });
    
    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct PropertyData {
    pub property_id: u64,
    pub name: String,
    pub description: String,
    pub price_per_day: u64,
    pub min_duration: u8,
    pub max_duration: u8,
}

#[event]
pub struct PropertyListed {
    pub property_id: u64,
    pub owner: Pubkey,
    pub price_per_day: u64,
    pub smart_lock_id: [u8; 32],
}
