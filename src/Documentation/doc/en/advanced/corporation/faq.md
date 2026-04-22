# FAQ

#### What is a corporation good for?

Corporations generate income that can be used for player purchases such as augmentations, or for bribing factions for reputation.

#### How many investment rounds are there?

There are 4 rounds.

#### Investors take too many shares. Can I buy them back later?

No.

#### The government takes too many shares when I use the "Seed money" option. Can I buy them back later?

No.

#### Why can I not buy back my shares?

There's a limit to the proportion of shares which can be owned by investors and the government. You will keep full control of the corporation and can make enough profits for it not to matter.

#### My corporation generates profit. Why does my money not increase?

Go public and set a dividend.

#### Why is my "earnings as a shareholder" lower than my calculation ("Dividends per share" \* "Owned Stock Shares")?

Dividend income is affected by a penalty modifier called "tribute modifier". `ShadyAccounting` and `GovernmentPartnership` reduce this penalty modifier. See [Financials](./financials.md).

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

Common causes:

- The office has no employees in Operations or Engineer.
- The warehouse has no available storage space.

#### I unlocked "Smart Supply", but it does not work or its behavior is weird.

Common causes:

- Smart Supply is disabled. This can happen when it is unlocked after purchasing a warehouse.
- Try switching to "leftovers" mode.

#### Is research's benefit shared between different divisions?

It's shared if those divisions are in the same industry. However, Research Points (RP) is not shared.

#### What are boost materials?

They are materials which boost [production rate](./production-rates.md) when they are in a division's warehouse.

#### Why does `setJobAssignment` not take effect immediately?

It only takes effect in the next cycle's START state.

#### Why do energy and morale matter?

They are used for calculating `employeeProductionByJob`, then that property is used for calculating other things such as Research Points, material's quality, product's stats, division production, material/product's `MaxSalesVolume`, etc.

#### What do Interns do?

They help maintain energy and morale.

#### Are there any other ways to maintain these 2 stats?

See [Office](./office.md).

#### How do tea and party costs work?

See [Office](./office.md).

#### What are Awareness and Popularity?

See [AdVert](./advert.md).

#### Is Wilson retroactive?

No.

#### What are Demand and Competition?

See [Demand - Competition](./demand-competition.md).

#### How do "Design investment" and "Marketing investment" affect a new product?

See [Product](./product.md).

#### What is the difference between Market-TA1 and Market-TA2?

Prices too far above market price receive a penalty modifier which reduces sales volume (explained in [Sales](./sales.md)). Market-TA1 sets the highest price which doesn't trigger any penalty. However, this can be overly conservative, since sometimes the penalty wouldn't matter. For example if the penalty would limit sales volume to 2000 but your desired sale amount is just 400. Market-TA2 finds a higher price, which incurs more of a penalty, but can still sell your desired amount. Same quantity sold but at a higher price. With products, the price set by Market-TA2 can be much higher than Market-TA1.

#### I bought Market-TA2, but it does not set the optimal price for me.

Market-TA2 must be enabled after being unlocked.

### Why can I not sell all produced goods in the storage even after using Market-TA1 and Market-TA2?

Maximum sales volume is determined by several factors. Since Market-TA1 and Market-TA2 won't choose prices that are lower than market price, they won't help you exceed the max sales volume for market priced products; for that you will need to adjust other factors. See [Sales](./sales.md) for more information.

#### How do I discard materials/products?

Set the selling price to 0.
