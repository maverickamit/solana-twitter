use anchor_lang::prelude::*;

declare_id!("EGqjPAXfu96K6k5tXWFJGBNREesNxsGYAZTDvb8pCADz");

#[program]
pub mod solana_twitter {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
