# FAQ

#### What is a corporation good for?

Generating ridiculously massive income. With this income, you can buy whatever you want, e.g., augmentations or bribing factions for reputation.

#### How many investment rounds should I take?

There are 4 rounds, and you should take all of them. Investment funds greatly boost your corporation development. Your corporation won't be able to reach its full potential in a reasonable time without them.

#### Investors take too many shares. Can I buy them back later?

No.

#### The government takes too many shares when I use the "Seed money" option. Can I buy them back later?

No.

#### Why can I not buy back my shares?

You can buy back shares that were issued. Shares that were given to the government (when you use seed money) and investors (when you take investment offers) cannot be bought back.

You always have total control over your corporation, so you don't have to worry about "ownership". When your profit hits exponential growth, the share percentage means nothing. If your corporation's profit is 1e90/s and you only have 1% shares, you still get 1e88/s.

#### My corporation generates profit. Why does my money not increase?

Go public and set a dividend.

#### How many shares should I issue?

0

#### Why is my "earnings as a shareholder" lower than my calculation ("Dividends per share" \* "Owned Stock Shares")?

You have to pay tax. ShadyAccounting and GovernmentPartnership reduce tax. Check this [section](./financial-statement.md) for details.

#### All corporation APIs require too much RAM. How do I deal with it?

Earn money by any normal means: hacking, committing crimes, cheating in the casino, etc. There is also another way:

- Follow the [advice](./general-advice.md) on round 1, but at the end, do not accept the investment offer.
- Go public immediately.
- Sell all your shares immediately.
- Sell the CEO position and start a new corporation.

Also note that you don't have to do everything in one script. You can make smaller scripts that do less and use fewer APIs to keep the RAM usage down, and use `run()` to chain them together.

#### Why can I not create a corporation with the government's seed money ("Use seed money")?

That option is only available in BN3.

#### Can I sell my corporation via API?

No.

#### Can I transfer my (personal) money to the corporation's funds?

No. However, with SF9, you can sell hashes for corporation funds or RP.

#### Why can I not bribe factions for reputations? What's the exchange rate?

Your corporation's valuation must be at least 100e12 to bribe. Exchange rate: 1e9/reputation.

#### What's the maximum number of divisions?

In BN3, it's 20.

#### Why does my division not produce anything?

Check these things:

- Have at least 1 employee in Operations or Engineer
- Have enough storage space. Warehouse congestion is a common problem.

#### Which industry should I focus on?

Check this [section](./industry-supply-chain.md).

#### Should I create more divisions for the same industry? For example: multiple Agriculture divisions.

No, focus your funds on one division for each industry.

#### Which "feature" (Export, Smart Supply, etc.) should I unlock?

Check this [section](./unlocks-upgrade-research.md).

#### Which upgrade should I buy?

Check this [section](./unlocks-upgrade-research.md).

#### Which research should I buy?

Check this [section](./unlocks-upgrade-research.md).

#### I unlocked "Smart Supply", but it does not work or its behavior is weird.

Check these things:

- You have to enable it if you unlock it after purchasing a warehouse.
- Always choose "Use leftovers". "Use imported" is only useful in special cases.

#### How do I implement a custom Smart Supply script?

Check this [section](./smart-supply.md).

#### How do I setup the quantity of exported materials?

Specify an export string. The optimal export string is `(IPROD+IINV/10)*(-1)`. Check this [section](./miscellany.md) for details.

#### Is research's benefit shared between different divisions?

It's shared if those divisions are in the same industry. However, the RP pool is not shared.

#### Should I expand to all 6 cities?

Yes. In fact, you must do that for maximum efficiency. Check this [section](./boost-material.md).

#### What are boost materials?

They are the materials that boost [division production multiplier](./boost-material.md). There are 4 boost materials: AI Cores, Hardware, Real Estate, and Robots.

#### How many boost materials should I buy?

Check the optimizer in this [section](./boost-material.md).

#### Why does the [General advice](./general-advice.md) section tell me to use API to upgrade office size?

API (`upgradeOfficeSize`) gives you granular control over office size. You cannot do that through UI.

#### Why does setAutoJobAssignment not take effect immediately?

It only takes effect in the next cycle's START state.

#### Why do energy and morale matter?

They are used for calculating `employeeProductionByJob`, then that property is used for calculating other things: RP, material's quality, product's stats, division raw production, and material/product's `MaxSalesVolume`.

#### What do Interns do?

They maintain energy and morale. You should only use them if you don't want to write scripts. A tea/party script can maintain energy and morale for you, and it is very simple to implement. It's recommended to implement that script instead of wasting employees on the "Intern" job.

#### I use 1/9 as Intern ratio, but energy and morale still drop.

You can only use that ratio when your corporation works fine (funds > 0 or profit > 0). If it does not, use 1/6.

#### Are there any other ways to maintain these 2 stats?

There are research upgrades for that. However, you should never buy them. It's always better spending your RP elsewhere or just stock up on RP.

#### Buying tea and throwing parties cost me too much money. Why are they so expensive?

Tea and parties are cheap. If your budget is so low that they cost you too much money, it means you wasted too much of your funds.

#### How much money should I spend to throw parties? How often should I buy tea / throw party?

Check this [section](./office.md).

#### How do I know if the qualities of my input materials are too low and need to be improved?

Check this [section](./quality.md).

#### What are Awareness and Popularity?

Check this [section](./wilson-analytics-advert.md).

#### Should I buy Dream Sense?

No. Check this [section](./wilson-analytics-advert.md) for the reason.

#### Is Wilson retroactive?

No.

#### Does that mean I should buy Wilson as soon as possible? If yes, then why don't you buy any Wilson in round 1 and 2?

You should buy Wilson as soon as possible, but not too soon. Round 1 and 2 are those cases. Check this [section](./wilson-analytics-advert.md) for details.

#### What are Demand and Competition?

Check this [section](./demand-competition.md).

#### How much should I spend for "Design investment" and "Marketing investment" when I create a new product? How do they affect the product?

They are not too important. It's fine to spend 1% of your current funds for them. Check this [section](./product.md) for details.

#### Should I buy Market-TA1?

No, wait for Market-TA2. Market-TA1 is useless in most cases.

#### When should I buy Market-TA2?

As soon as possible, it greatly increases your profit because it can find the optimal price. However, you should not use all your RP to buy it. Depleting the entire RP pool severely degrades your product rating. That research costs a total of 75e3 RP (Hi-Tech R&D Laboratory + Market-TA1 + Market-TA2), so I recommend saving up 150e3 RP before buying it. Depleting half of the RP pool is acceptable, considering the positive effect of Market-TA2.

#### What is the difference between Market-TA1 and Market-TA2?

If you set the price of the material/product too much higher than the market price, you will get a penalty modifier that makes the material/product not be able to be sold as much as it should be.

Market-TA1 sets a price higher than the market price while ensuring that you don't get the penalty modifier.

Market-TA2 assumes that you can sell all stored units without any problems and can accept a penalty modifier. If that's the case, it finds the highest possible price.

With products, the price set by Market-TA2 is usually several orders of magnitude higher than Market-TA1.

#### I bought Market-TA2, but it does not set the optimal price for me.

You have to enable it.

#### Is there a workaround for Market-TA2? Waiting for RP takes too long.

Yes, you can reimplement Market-TA2. Implementing a custom Market-TA2 script is the best optimization in round 3+. Check this [section](./optimal-selling-price-market-ta2.md) to see how to do it.

### Why can I not sell all produced goods in the storage even after using Market-TA1 and Market-TA2?

In the SALE state, the game calculates `MaxSalesVolume` of the material/product. This is the number of items that can be sold in this state. This value is the product of many multipliers, and one of those multipliers is the markup multiplier. When it's higher than 1, it's a bonus multiplier helping you sell more items. When it's lower than 1, it's a penalty modifier making you sell fewer items.

With Market TA1 and Market TA2, the markup multiplier is always less than or equal to 1. In other words, they never help you sell more items than you can. Their job is to help you find a good price that is higher than the market price. If you want to sell more items than you can, you need to set the price below the market price. This is not the job of Market TA1 and Market TA2.

Check this [section](./optimal-selling-price-market-ta2.md) for more information and tips on how to increase `MaxSalesVolume`.

#### How do I discard materials/products?

Set the selling price to 0.

#### What is a dummy division?

Check this [section](./miscellany.md).

#### Can I skip the Chemical division in round 2 and invest all funds in the Agriculture division?

No. Without a Chemical division, the quality of your Agriculture division's output materials will be too low, and you cannot sell all those low-quality materials at a good price.
