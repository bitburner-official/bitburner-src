# Stanek

Allison is a bit crazy.
But her special [Augmentation](../basic/augmentations.md) is very useful despite its ~~bugs~~ features.
The Gift consists of a grid of squares in which Tetris-like pieces called fragments can be placed.
Each fragment boost a different player multiplier.
However, the fragments are not very powerful by themselves.

You can only accept the Gift if you have no augmentations queued or installed. The "NeuroFlux Governor" augmentation is
the only exception; i.e., if you queued or installed only that augmentation and nothing else, you still satisfy this
condition.

To increase the power of a fragment, the `ns.stanek.charge()` function needs to be called.
More threads means more power.

There are also special fragments called booster fragments which increase the power of the fragment it touches.
