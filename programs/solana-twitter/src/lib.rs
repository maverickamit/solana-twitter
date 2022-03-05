use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;

declare_id!("EGqjPAXfu96K6k5tXWFJGBNREesNxsGYAZTDvb8pCADz");

#[program]
pub mod solana_twitter {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
//Context of send_tweet instruction
pub struct sendTweet<'info> {
    #[account(init, payer = author, space = Tweet::LEN )] //Initializes a tweet account 
    pub tweet : Account<'info,Tweet>,
    #[account(mut)]
    pub author: Signer<'info>,
    #[account(address = system_program::ID)] 
    pub system_program:AccountInfo<'info>

}

//Defining a tweet account
#[account]
pub struct Tweet {
    pub author: Pubkey,
    pub timestamp: i64,
    pub topic: String,
    pub content: String
}

//Store sizes of the properties (in bytes) of Tweet struct as constants.
const DISCRIMINATOR_LENGTH: usize = 8;
const PUBLIC_KEY_LENGTH: usize = 32;
const TIMESTAMP_LENGTH: usize = 8;
const STRING_LENGTH_PREFIX: usize = 4; // Stores the size of the string.
const MAX_TOPIC_LENGTH: usize = 50 * 4; // 50 chars max.
const MAX_CONTENT_LENGTH: usize = 280 * 4; // 280 chars max.

//Implement a constant(const LEN) on the Tweet account that provides its total size.
impl Tweet {
    const LEN: usize = (DISCRIMINATOR_LENGTH + PUBLIC_KEY_LENGTH  + TIMESTAMP_LENGTH
     + STRING_LENGTH_PREFIX + MAX_TOPIC_LENGTH + STRING_LENGTH_PREFIX + MAX_CONTENT_LENGTH); 
}