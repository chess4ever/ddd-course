defmodule Movie do
  @moduledoc """
  Movie value object
  """

  @type t :: %__MODULE__{}

  @enforce_keys [:title, :release_year]
  defstruct [:title, :release_year, :duration, :genre, :director, :actors, :producer]

  @spec new(map) :: t
  def new(%{title: nil, release_year: nil}), do: raise("Nil arguments")
  def new(args), do: struct!(__MODULE__, args)

  @spec equals(t, t) :: bool
  def equals(%__MODULE__{} = a, %__MODULE__{} = b) do
    a.title === b.title && a.release_year === b.release_year
  end
end
