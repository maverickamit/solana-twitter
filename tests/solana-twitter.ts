import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SolanaTwitter } from "../target/types/solana_twitter";
import * as assert from "assert";

describe("solana-twitter", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.SolanaTwitter as Program<SolanaTwitter>;
  let tweet:anchor.web3.Keypair;
  beforeEach( async()=>{
     tweet = anchor.web3.Keypair.generate();
  })

  it('can send a new tweet', async () => {
    // Call the "SendTweet" instruction.
    await program.rpc.sendTweet('veganism', 'Hummus, am I right?', {
        accounts: {
            tweet: tweet.publicKey,
            author: program.provider.wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [tweet],
    });

    // Fetch the account details of the created tweet.
    const tweetAccount = await program.account.tweet.fetch(tweet.publicKey);
  	console.log(tweetAccount);

    //Ensure it has the right data
    assert.strictEqual(tweetAccount.author.toBase58(), program.provider.wallet.publicKey.toBase58())
    assert.strictEqual(tweetAccount.topic , 'veganism')
    assert.strictEqual(tweetAccount.content , 'Hummus, am I right?')
    assert.ok(tweetAccount.timestamp)
  });

  it ("can send a new tweet without a topic", async () => {
  //Call the SendTweet instruction
    await program.rpc.sendTweet('', 'Hello!', {
    accounts: {
        tweet: tweet.publicKey,
        author: program.provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
     },
     signers: [tweet],
    });
    // Fetch the account details of the created tweet.
    const tweetAccount = await program.account.tweet.fetch(tweet.publicKey);
    console.log(tweetAccount);
 
    //Ensure it has the right data
    assert.strictEqual(tweetAccount.author.toBase58(), program.provider.wallet.publicKey.toBase58())
    assert.strictEqual(tweetAccount.topic , '')
    assert.strictEqual(tweetAccount.content , 'Hello!')
    assert.ok(tweetAccount.timestamp)
  })
});
