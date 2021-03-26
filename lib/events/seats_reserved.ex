defmodule SeatsReserved do
  @type t :: %__MODULE__{}

  @enforce_keys [:customer, :seats]
  defstruct [:customer, :seats]

  @spec new(map) :: t
  def new(%{customer: nil, seats: nil}), do: raise("Nil arguments")
  def new(args), do: struct!(__MODULE__, args)
end
