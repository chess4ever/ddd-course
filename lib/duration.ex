defmodule Duration do
  @moduledoc """
  Duration value object
  """

  @type t :: %__MODULE__{}

  @enforce_keys [:hours, :minutes]
  defstruct [:hours, :minutes]

  @spec new(map) :: t
  def new(%{hours: nil, minutes: nil}), do: raise("Nil arguments")
  def new(args), do: struct!(__MODULE__, args)

  @spec equals(t, t) :: bool
  def equals(%__MODULE__{} = a, %__MODULE__{} = b) do
    a.hours === b.hours && a.minutes === b.minutes
  end
end
