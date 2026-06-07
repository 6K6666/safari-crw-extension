# Cargo Exports

## How To Run Locally

1. Create a bot in the Wiki [here](https://consumerrights.wiki/w/Special:BotPasswords)

> [!NOTE]
> Make sure that the bot has permissions to:
>
> `Create, query and delete data through the Cargo extension`

2. Copy `.env.sample` to `.env`, then fill in your wiki username, bot name, and bot password. The `.env` file is ignored by Git and must not be committed.
3. Configure a Python virtual environment and install any dependencies necessary

```shell
pip install -r requirements-dev.txt
```

4. Run the script `main.py`

```shell
dotenv run -- python main.py
```
