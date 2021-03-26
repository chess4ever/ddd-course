defmodule Screening do
  @enforce_keys [:id]
  defstruct [:id, :seats]

  def new(events) do
    init_state = %__MODULE__{
      id: Enum.random(0..1_000_000),
      seats: []
    }

    events
    |> Enum.reduce(init_state, fn e, acc -> apply_event(e, acc) end)
  end

  def execute(
        %ReserveSeats{customer: customer, seats: seats},
        %__MODULE__{} = _a
      ) do
    {:ok, SeatsReserved.new(%{customer: customer, seats: seats})}
  end

  def apply_event(
        %SeatsReserved{seats: event_seats},
        %__MODULE__{seats: seats} = screening
      ) do
    %__MODULE__{screening | seats: [event_seats | seats]}
  end
end
