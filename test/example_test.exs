defmodule Customer do
  @enforce_keys [:name]
  defstruct [:name]

  def new(name) do
    %__MODULE__{name: name}
  end
end

defmodule Seat do
  @enforce_keys [:row, :column]
  defstruct [:row, :column]

  def new(row, column) do
    %__MODULE__{row: row, column: column}
  end
end

defmodule ReserveSeat do
  @type t :: %__MODULE__{}

  @enforce_keys [:customer, :seats]
  defstruct [:customer, :seats]

  @spec new(map) :: t
  def new(%{customer: nil, seats: nil}), do: raise("Nil arguments")
  def new(args), do: struct!(__MODULE__, args)
end

defmodule ReservationHandler do
  def handle(%ReserveSeat{} = _cmd) do
    :ok
  end
end

defmodule ReservationTest do
  use ExUnit.Case

  test "customer reserves a free seat" do
    customer = Customer.new("foo")
    seats = [Seat.new("f", "4"), Seat.new("f", "5")]

    assert :ok =
             ReserveSeat.new(%{customer: customer, seats: seats})
             |> ReservationHandler.handle()
  end

  # test "customer tries to reserve a reserved seat"
end
