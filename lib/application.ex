defmodule MovieApp do
  @moduledoc false

  use Application

  require Logger

  def start(_type, _args) do
    Logger.info("Starting Movie...")

    children = [
      {Movie.EventStore, []},
      {ReadModel.Screening,
       %{
         available: MapSet.new([Seat.new("a", "1"), Seat.new("a", "2"), Seat.new("a", "3")]),
         reserved: MapSet.new([])
       }}
    ]

    opts = [strategy: :one_for_one, name: Movie.Supervisor, max_restarts: 10, max_seconds: 10]
    Supervisor.start_link(children, opts)
  end
end
