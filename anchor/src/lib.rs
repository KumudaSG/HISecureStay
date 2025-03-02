use anchor_lang::prelude::*;

pub mod error;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("9GmbEnoSYVse4AADADyKNfy4s3XWC3oKzzWb8HxazHjx");

#[program]
pub mod hi_secure_stay {
    use super::*;

    // Register a new smart lock
    pub fn register_smart_lock(
        ctx: Context<RegisterSmartLock>,
        lock_id: [u8; 32],
        name: String,
    ) -> Result<()> {
        instructions::register_smart_lock::handle_register_smart_lock(ctx, lock_id, name)
    }

    // List a property for rent
    pub fn list_property(
        ctx: Context<ListProperty>,
        property_data: instructions::list_property::PropertyData,
    ) -> Result<()> {
        instructions::list_property::handle_list_property(ctx, property_data)
    }

    // Book a property
    pub fn book_property(
        ctx: Context<BookProperty>,
        duration_days: u8,
    ) -> Result<()> {
        instructions::book_property::handle_book_property(ctx, duration_days)
    }

    // Generate a digital access key
    pub fn generate_access_key(
        ctx: Context<GenerateAccessKey>,
    ) -> Result<()> {
        instructions::generate_access_key::handle_generate_access_key(ctx)
    }

    // Access a property with a digital key
    pub fn access_property(
        ctx: Context<AccessProperty>,
    ) -> Result<()> {
        instructions::access_property::handle_access_property(ctx)
    }

    // Revoke access to a property
    pub fn revoke_access(
        ctx: Context<RevokeAccess>,
        tenant: Pubkey,
    ) -> Result<()> {
        instructions::revoke_access::handle_revoke_access(ctx, tenant)
    }
}
