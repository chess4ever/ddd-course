defmodule Movie.EventStore do
  use GenServer

  def start_link(init_state),
    do: GenServer.start_link(__MODULE__, init_state, name: __MODULE__)

  def get(), do: GenServer.call(__MODULE__, :get)
  def put(e), do: GenServer.call(__MODULE__, {:put, e})

  @impl true
  def init(stack \\ []) do
    {:ok, stack}
  end

  @impl true
  def handle_call(:get, _from, events) do
    {:reply, events, events}
  end

  @impl true
  def handle_call({:put, event}, _from, events) do
    {:reply, :ok, [event | events]}
  end
end
