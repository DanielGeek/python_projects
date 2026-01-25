class Account:
    def __init__(self, username, initial_deposit):
        self.username = username
        self.initial_deposit = initial_deposit
        self.balance = initial_deposit
        self.portfolio = {}
        self.transactions = []

    def deposit(self, amount):
        if amount < 0:
            raise ValueError("Deposit amount must be positive.")
        self.balance += amount
        self.transactions.append({
            'type': 'deposit',
            'amount': amount,
            'date': '2023-10-10'
        })

    def withdraw(self, amount):
        if amount < 0:
            raise ValueError("Withdrawal amount must be positive.")
        if amount > self.balance:
            raise ValueError("Insufficient funds for withdrawal.")
        self.balance -= amount
        self.transactions.append({
            'type': 'withdraw',
            'amount': amount,
            'date': '2023-10-10'
        })

    def buy_shares(self, symbol, quantity):
        if quantity < 0:
            raise ValueError("Quantity must be positive.")
        price = get_share_price(symbol)
        cost = price * quantity
        if cost > self.balance:
            raise ValueError("Insufficient funds to buy shares.")
        self.balance -= cost
        if symbol in self.portfolio:
            self.portfolio[symbol] += quantity
        else:
            self.portfolio[symbol] = quantity
        self.transactions.append({
            'type': 'buy',
            'symbol': symbol,
            'quantity': quantity,
            'price': price,
            'date': '2023-10-10'  # Using a fixed date for simplicity
        })

    def sell_shares(self, symbol, quantity):
        if quantity < 0:
            raise ValueError("Quantity must be positive.")
        if symbol not in self.portfolio or self.portfolio[symbol] < quantity:
            raise ValueError("Not enough shares to sell.")
        price = get_share_price(symbol)
        proceeds = price * quantity
        self.balance += proceeds
        self.portfolio[symbol] -= quantity
        if self.portfolio[symbol] == 0:
            del self.portfolio[symbol]
        self.transactions.append({
            'type': 'sell',
            'symbol': symbol,
            'quantity': quantity,
            'price': price,
            'date': '2023-10-10'  # Using a fixed date for simplicity
        })

    def calculate_total_value(self):
        total_value = self.balance
        for symbol, quantity in self.portfolio.items():
            total_value += get_share_price(symbol) * quantity
        return total_value

    def calculate_profit_or_loss(self):
        return self.calculate_total_value() - self.initial_deposit

    def get_holdings(self):
        return self.portfolio

    def get_transactions(self):
        return self.transactions


def get_share_price(symbol):
    prices = {'AAPL': 150.0, 'TSLA': 800.0, 'GOOGL': 2750.0}
    return prices.get(symbol, 0.0)