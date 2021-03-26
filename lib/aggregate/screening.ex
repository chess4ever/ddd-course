defmodule Screening do
  @enforce_keys [:id]
  defstruct [:id, :seats]

  def new(events) do
    init_state = %__MODULE__{
      id: UUID.uuid4(),
      seats: MapSet.new()
    }

    events
    |> Enum.reduce(init_state, fn e, acc -> apply_event(e, acc) end)
  end

  def execute(
        %ReserveSeats{customer: customer, seats: command_seats},
        %__MODULE__{seats: seats} = _a
      ) do
    case MapSet.intersection(seats, MapSet.new(command_seats)) |> MapSet.size() do
      0 ->
        {:ok, SeatsReserved.new(%{customer: customer, seats: command_seats})}

      _ ->
        :error
    end
  end

  def apply_event(
        %SeatsReserved{seats: event_seats},
        %__MODULE__{seats: seats} = screening
      ) do
    %__MODULE__{screening | seats: MapSet.union(seats, MapSet.new(event_seats))}
  end
end
