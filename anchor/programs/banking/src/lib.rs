#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod banking {
    use super::*;

  pub fn close(_ctx: Context<CloseBanking>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.banking.count = ctx.accounts.banking.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.banking.count = ctx.accounts.banking.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeBanking>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.banking.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeBanking<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + Banking::INIT_SPACE,
  payer = payer
  )]
  pub banking: Account<'info, Banking>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseBanking<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub banking: Account<'info, Banking>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub banking: Account<'info, Banking>,
}

#[account]
#[derive(InitSpace)]
pub struct Banking {
  count: u8,
}
