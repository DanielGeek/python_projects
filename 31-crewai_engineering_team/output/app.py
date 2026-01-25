import gradio as gr
from accounts import Account, get_share_price

account = None

def create_account(username, initial_deposit):
    global account
    account = Account(username, initial_deposit)
    return f"Account created for {username} with initial deposit of ${initial_deposit}."

def deposit_funds(amount):
    if account:
        try:
            account.deposit(amount)
            return f"Deposited ${amount}. Current balance: ${account.balance}."
        except ValueError as e:
            return str(e)
    return "Account not found. Please create an account first."

def withdraw_funds(amount):
    if account:
        try:
            account.withdraw(amount)
            return f"Withdrew ${amount}. Current balance: ${account.balance}."
        except ValueError as e:
            return str(e)
    return "Account not found. Please create an account first."

def buy_shares(symbol, quantity):
    if account:
        try:
            account.buy_shares(symbol, quantity)
            return f"Purchased {quantity} shares of {symbol}. Current balance: ${account.balance}."
        except ValueError as e:
            return str(e)
    return "Account not found. Please create an account first."

def sell_shares(symbol, quantity):
    if account:
        try:
            account.sell_shares(symbol, quantity)
            return f"Sold {quantity} shares of {symbol}. Current balance: ${account.balance}."
        except ValueError as e:
            return str(e)
    return "Account not found. Please create an account first."

def view_portfolio():
    if account:
        return str(account.get_holdings())
    return "Account not found. Please create an account first."

def view_transactions():
    if account:
        return str(account.get_transactions())
    return "Account not found. Please create an account first."

def view_total_value():
    if account:
        return f"Total value of portfolio: ${account.calculate_total_value()}"
    return "Account not found. Please create an account first."

def view_profit_or_loss():
    if account:
        return f"Profit/Loss: ${account.calculate_profit_or_loss()}"
    return "Account not found. Please create an account first."

with gr.Blocks() as demo:
    gr.Markdown("## Trading Simulation Platform")
    
    with gr.Tab("Create Account"):
        with gr.Row():
            username = gr.Textbox(label="Username")
            initial_deposit = gr.Number(label="Initial Deposit", value=0.0)
        create_btn = gr.Button("Create Account")
        create_output = gr.Textbox(label="Output", interactive=False)
        create_btn.click(fn=create_account, inputs=[username, initial_deposit], outputs=create_output)
    
    with gr.Tab("Deposit Funds"):
        with gr.Row():
            deposit_amount = gr.Number(label="Amount to Deposit", value=0.0)
        deposit_btn = gr.Button("Deposit Funds")
        deposit_output = gr.Textbox(label="Output", interactive=False)
        deposit_btn.click(fn=deposit_funds, inputs=deposit_amount, outputs=deposit_output)
    
    with gr.Tab("Withdraw Funds"):
        with gr.Row():
            withdraw_amount = gr.Number(label="Amount to Withdraw", value=0.0)
        withdraw_btn = gr.Button("Withdraw Funds")
        withdraw_output = gr.Textbox(label="Output", interactive=False)
        withdraw_btn.click(fn=withdraw_funds, inputs=withdraw_amount, outputs=withdraw_output)

    with gr.Tab("Buy Shares"):
        with gr.Row():
            buy_symbol = gr.Textbox(label="Symbol")
            buy_quantity = gr.Number(label="Quantity", value=0)
        buy_btn = gr.Button("Buy Shares")
        buy_output = gr.Textbox(label="Output", interactive=False)
        buy_btn.click(fn=buy_shares, inputs=[buy_symbol, buy_quantity], outputs=buy_output)
    
    with gr.Tab("Sell Shares"):
        with gr.Row():
            sell_symbol = gr.Textbox(label="Symbol")
            sell_quantity = gr.Number(label="Quantity", value=0)
        sell_btn = gr.Button("Sell Shares")
        sell_output = gr.Textbox(label="Output", interactive=False)
        sell_btn.click(fn=sell_shares, inputs=[sell_symbol, sell_quantity], outputs=sell_output)
    
    with gr.Tab("View Portfolio"):
        portfolio_btn = gr.Button("View Portfolio")
        portfolio_output = gr.Textbox(label="Portfolio", interactive=False)
        portfolio_btn.click(fn=view_portfolio, inputs=None, outputs=portfolio_output)
    
    with gr.Tab("View Transactions"):
        transactions_btn = gr.Button("View Transactions")
        transactions_output = gr.Textbox(label="Transactions", interactive=False)
        transactions_btn.click(fn=view_transactions, inputs=None, outputs=transactions_output)
    
    with gr.Tab("View Total Value"):
        total_value_btn = gr.Button("View Total Value")
        total_value_output = gr.Textbox(label="Total Value", interactive=False)
        total_value_btn.click(fn=view_total_value, inputs=None, outputs=total_value_output)
    
    with gr.Tab("View Profit or Loss"):
        profit_loss_btn = gr.Button("View Profit or Loss")
        profit_loss_output = gr.Textbox(label="Profit or Loss", interactive=False)
        profit_loss_btn.click(fn=view_profit_or_loss, inputs=None, outputs=profit_loss_output)

demo.launch()