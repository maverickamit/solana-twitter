use anchor_lang::prelude::*;

declare_id!("EGqjPAXfu96K6k5tXWFJGBNREesNxsGYAZTDvb8pCADz");

#[program]
pub mod solana_twitter {
    use super::*;

    pub fn send_tweet(ctx: Context<SendTweet>,topic: String,content: String) -> Result<()> {
        let tweet: &mut Account<Tweet> = &mut ctx.accounts.tweet;
        let author:&Signer = &ctx.accounts.author;
        let clock: Clock = Clock::get().unwrap();
      
        if topic.chars().count()>50 {
            return Err(ErrorCode::TopicTooLong.into())
        }

        if content.chars().count()>280 {
            return Err(ErrorCode::ContentTooLong.into())
        }
        
        //storing values in tweet account
        tweet.author = *author.key;
        tweet.timestamp = clock.unix_timestamp;
        tweet.topic = topic;
        tweet.content = content;
        Ok(())
    }
}

#[derive(Accounts)]
//Context of send_tweet instruction
pub struct SendTweet<'info> {
    #[account(init, payer = author, space = Tweet::LEN )] //Initializes a tweet account 
    pub tweet : Account<'info,Tweet>,
    #[account(mut)]
    pub author: Signer<'info>,
    pub system_program: Program<'info, System> 

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

//implement a new ErrorCode 
#[error_code(offset = 0)]
pub enum ErrorCode {
    #[msg("The provided topic should be 50 characters long maximum.")]
    TopicTooLong,
    #[msg("The provided content should be 280 characters long maximum.")]
    ContentTooLong,
}