// speed to move between 2 tiles
export const moveSpeed = (level: number) => 1000 / (level + 10);

// speed to reduce components
export const reduceSpeed = (level: number) => 50000 / (level + 10);

// speed to transfer components between devices
export const transferSpeed = (level: number) => 4000 / (level + 10);

// speed to install / uninstall devices and tweak ISockets
export const installSpeed = (level: number) => 100000 / (level + 10);

// time until ISocket refreshes
export const emissionSpeed = (level: number) => 100000 / (level + 10);
