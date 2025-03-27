interface User {
  userName: string
}
interface Account {
  user: User;
  logout(): void;
}

export { Account }
