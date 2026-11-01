namespace FinoParadise.Economy
{
    // Display-only snapshot. Balances may only be updated from a trusted server response.
    public sealed class WalletSnapshot
    {
        public long Coins { get; private set; }
        public long Diamonds { get; private set; }

        public void ApplyServerSnapshot(long coins, long diamonds)
        {
            Coins = coins < 0 ? 0 : coins;
            Diamonds = diamonds < 0 ? 0 : diamonds;
        }
    }
}
