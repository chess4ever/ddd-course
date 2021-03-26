defmodule ReadModel.Screening do
  use Agent

  def start_link(init_state) do
    Agent.start_link(fn -> init_state end, name: __MODULE__)
  end

  def reserve(seats) do
    reserving_seats = MapSet.new(seats)

    Agent.update(__MODULE__, fn %{available: available, reserved: reserved} ->
      %{
        available: MapSet.difference(available, reserving_seats),
        reserved: MapSet.union(reserved, reserving_seats)
      }
    end)
  end

  def available do
    {:ok, available} = Agent.get(__MODULE__, &Map.fetch(&1, :available))
    MapSet.to_list(available)
  end
end
