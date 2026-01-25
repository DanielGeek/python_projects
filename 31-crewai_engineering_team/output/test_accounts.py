import unittest
from accounts import Account, get_share_price

class TestAccount(unittest.TestCase):

    def setUp(self):
        self.account = Account('test_user', 1000)

    def test_initial_balance(self):
        self.assertEqual(self.account.balance, 1000)
        self.assertEqual(self.account.initial_deposit, 1000)

    def test_deposit(self):
        self.account.deposit(500)
        self.assertEqual(self.account.balance, 1500)

    def test_deposit_negative(self):
        with self.assertRaises(ValueError):
            self.account.deposit(-100)

    def test_withdrawal(self):
        self.account.withdraw(300)
        self.assertEqual(self.account.balance, 700)

    def test_withdrawal_negative(self):
        with self.assertRaises(ValueError):
            self.account.withdraw(-100)

    def test_withdrawal_insufficient(self):
        with self.assertRaises(ValueError):
            self.account.withdraw(2000)

    def test_buy_shares(self):
        # Buy 5 shares of AAPL at $150 each = $750
        self.account.buy_shares("AAPL", 5)
        self.assertEqual(self.account.portfolio["AAPL"], 5)
        self.assertEqual(self.account.balance, 250)  # 1000 - 750

    def test_buy_shares_insufficient(self):
        with self.assertRaises(ValueError):
            self.account.buy_shares("GOOGL", 1)  # GOOGL costs $2750, more than balance

    def test_buy_shares_negative(self):
        with self.assertRaises(ValueError):
            self.account.buy_shares("AAPL", -5)

    def test_sell_shares(self):
        # First buy shares
        self.account.buy_shares("AAPL", 5)
        # Then sell 2 shares
        self.account.sell_shares("AAPL", 2)
        self.assertEqual(self.account.portfolio["AAPL"], 3)
        # Balance should be: 250 + (2 * 150) = 550
        self.assertEqual(self.account.balance, 550)

    def test_sell_shares_insufficient(self):
        with self.assertRaises(ValueError):
            self.account.sell_shares("AAPL", 1)  # Don't own any shares

    def test_sell_shares_negative(self):
        with self.assertRaises(ValueError):
            self.account.sell_shares("AAPL", -1)

    def test_calculate_total_value(self):
        # Buy shares and check total value
        self.account.buy_shares("AAPL", 5)  # Spend $750
        total_value = self.account.calculate_total_value()
        # Should be: balance ($250) + shares value (5 * $150 = $750) = $1000
        self.assertEqual(total_value, 1000)

    def test_calculate_profit_or_loss(self):
        # Buy shares and calculate profit/loss
        self.account.buy_shares("AAPL", 5)  # Spend $750
        profit_loss = self.account.calculate_profit_or_loss()
        # Should be 0 since we haven't gained or lost money yet
        self.assertEqual(profit_loss, 0)

    def test_get_holdings(self):
        self.account.buy_shares("AAPL", 3)  # $450
        self.account.buy_shares("AAPL", 2)  # $300 más, total $750
        expected = {"AAPL": 5}
        self.assertEqual(self.account.get_holdings(), expected)

    def test_get_transactions(self):
        initial_transactions = len(self.account.get_transactions())
        self.account.deposit(100)
        final_transactions = len(self.account.get_transactions())
        self.assertEqual(final_transactions, initial_transactions + 1)

    def test_get_share_price(self):
        self.assertEqual(get_share_price("AAPL"), 150.0)
        self.assertEqual(get_share_price("TSLA"), 800.0)
        self.assertEqual(get_share_price("GOOGL"), 2750.0)
        self.assertEqual(get_share_price("UNKNOWN"), 0.0)

if __name__ == '__main__':
    unittest.main()
