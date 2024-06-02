export const tutorial = `# Myrian

Myrian is the name of the OS that the BitNodes run on.

By gaining access to the OS directly you can start to break it apart by generating vulnerabilities (vulns).
You do so by interracting with the various devices in the OS, represented by a grid.

## Devices

A device is a component that takes space on the Myrian, no 2 devices can be on the same tile.
Devices can only interract when directly adjacent to each other. When one or more device is
performing an action it will become busy and no other actions can be taken until the current one finishes.

Contrary to every other mechanic in the game. Async functions using myrian functions CAN run simultenaously.


### Bus

The most important device is the Bus. Here's a few of the things it can do:

- move, only 1 tile at a time and that tile must be empty. No diagonal.
- transfer content, most entity can store items called components, bus are the only device that can transfer components to and from other devices
- use other devices, e.g. Use a Reducer device to create new components.

### ISocket

These devices produce basic components that can be used for other devices, [r0, g0, b0].
They must be picked up by busses and will eventually produce another one after a certain cooldown has passed.

### OSocket

These devices request components and produce vulns in return, a bus simply needs to transfer a component into a OSocket content in order to fulfill the request

### Reducer

These devices can be used by a bus, when being used they will first check their content, if the content matches one of the recipe they will take some time to consume their content in order to produce a new, upgraded, more valuable component, e.g. r0 + r0 => r1

### Cache

These devices act as storage for components.

### Lock

These devices cannot be installed. They appear after various conditions are fulfilled in order to block certain tiles.

### Battery

These devices are only relevant when the Magnetism glitch is active. It recharges the energy of a bus.

## Installing

Bus can install new devices, when they do so a lock will appear over the tile that will eventually become the device. The cost of any device depends on the number of that type of device currently in the OS.

### Uninstalling

A bus can remove a device, there is no refund.

## Tiers

Upgrading a reducers tier allows it to reduce components of a higher tier and ONLY that higher tier.
A tier 2 reducer can only tier 2 components like r1 + r1 => r2 and loses access to r0 + r0 => r1

Upgrading a batterys tier increases the amount of energy it produces.

## Glitches

glitches are optional difficulty modifiers that make the myrian more difficult BUT increase the amount of vulns gained.
All glitches start at level 0 and must be activated when you chose. They also have a max level that differs from glitch to glitch.

### Magnetism

By default bus lose 0 energy when moving. But when this glitch is active they start losing energy, at 0 energy bus move much more slowly. Batteries must be installed and used to charge busses.

### Friction

When Friction is active busses move more slowly.

### Rust

When rust is active, hidden tiles are set on the Myrian. When a bus steps on one of these hidden tiles one of their upgrade lowers. Higher Rust level means lowers by a larger amount and more rust tiles are set.

### Isolation

When Isolation is active busses transfer and charge more slowly.

### Segmentation

When Segmentation is active random Locks will spawn on the Myrian. You have to remove these locks or the bord will be overrun with Locks and you won't be able to move.

### Virtualization

When Virtualization is active busses install and uninstall devices more slowly.

### Jamming

When Jamming is active busses use reducers more slowly.

### Roaming

When Roaming is active, isockets and osockets start to move around the map

### Encryption

Encryption is the only glitch that's always active. The level of Encryption determines the complexity of the requests made by osockets.

## Destabilization

As the number of total vulns increase the bitnode becomes unstable and it's multiplier become more favorable.
`;
