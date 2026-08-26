export enum GoOpponent {
  none = "No AI",
  Netburners = "Netburners",
  SlumSnakes = "Slum Snakes",
  TheBlackHand = "The Black Hand",
  Tetrads = "Tetrads",
  Daedalus = "Daedalus",
  Illuminati = "Illuminati",
  w0r1d_d43m0n = "????????????",
}

export enum GoColor {
  white = "White",
  black = "Black",
  empty = "Empty",
}

export enum GoValidity {
  pointBroken = "该节点已离线，无法在此放置棋子",
  pointNotEmpty = "该节点已被棋子占据",
  boardRepeated = "重复之前的棋盘状态属于违规",
  noSuicide = "禁止自杀：不能让自己的棋子被提掉",
  notYourTurn = "还没轮到你落子",
  gameOver = "对局已经结束",
  invalid = "无效落子",
  valid = "有效落子",
}

export enum GoPlayType {
  move = "move",
  pass = "pass",
  gameOver = "gameOver",
}
