import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SolanaTwitter } from "../target/types/solana_twitter";
import * as assert from "assert";

describe("solana-twitter", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.SolanaTwitter as Program<SolanaTwitter>;
  let tweet: anchor.web3.Keypair;
  beforeEach(async () => {
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
    assert.strictEqual(tweetAccount.topic, 'veganism')
    assert.strictEqual(tweetAccount.content, 'Hummus, am I right?')
    assert.ok(tweetAccount.timestamp)
  });

  it("can send a new tweet without a topic", async () => {
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
    assert.strictEqual(tweetAccount.topic, '')
    assert.strictEqual(tweetAccount.content, 'Hello!')
    assert.ok(tweetAccount.timestamp)
  })

  it("can send a new tweet from a different author", async () => {
    //Create new user
    const otherUser = anchor.web3.Keypair.generate();

    //Requesting airdrop to get some lamports in the otherUser account
    const signature = await program.provider.connection.requestAirdrop(otherUser.publicKey, 1000000000)
    await program.provider.connection.confirmTransaction(signature)

    //Call the SendTweet instruction
    await program.rpc.sendTweet('veganism', 'Yay Tofu!', {
      accounts: {
        tweet: tweet.publicKey,
        author: otherUser.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [tweet, otherUser],
    });
    // Fetch the account details of the created tweet.
    const tweetAccount = await program.account.tweet.fetch(tweet.publicKey);
    console.log(tweetAccount);

    //Ensure it has the right data
    assert.strictEqual(tweetAccount.author.toBase58(), otherUser.publicKey.toBase58())
    assert.strictEqual(tweetAccount.topic, 'veganism')
    assert.strictEqual(tweetAccount.content, 'Yay Tofu!')
    assert.ok(tweetAccount.timestamp)
  })

  it('cannot provide a topic with more than 50 characters', async () => {
    try {
        const topicWith51Chars = 'a'.repeat(51);
        await program.rpc.sendTweet(topicWith51Chars, 'Hummus, am I right?', {
            accounts: {
                tweet: tweet.publicKey,
                author: program.provider.wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            },
            signers: [tweet],
        });
    } catch (error) {
      assert.strictEqual(error.toString(),"The provided topic should be 50 characters long maximum.");
      return;      
    }

    //If there are no errors thrown inside the try block
    assert.fail('The instruction should have failed with a 51-character topic.');
});
});
