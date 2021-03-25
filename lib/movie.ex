defmodule Movie do
  @moduledoc """
  Movie value object
  """

  @type t :: %__MODULE__{}

  @enforce_keys [:title, :release_year]
  defstruct [:title, :release_year, :duration, :genre, :director, :actors, :producer]

  @spec new(map) :: t
  def new(%{title: _title, release_year: _release_year} = args) do
    struct!(__MODULE__, args)
  end

  @spec equals(t, t) :: bool
  def equals(%__MODULE__{} = a, %__MODULE__{} = b) do
    a.title === b.title && a.release_year === b.release_year
  end
end

defmodule Duration do
  @moduledoc """
  Duration value object
  """

  @type t :: %__MODULE__{}

  @enforce_keys [:hours, :minutes]
  defstruct [:hours, :minutes]

  @spec new(map) :: t
  def new(%{hours: _hours, minutes: _minutes} = args) do
    struct!(__MODULE__, args)
  end

  @spec equals(t, t) :: bool
  def equals(%__MODULE__{} = a, %__MODULE__{} = b) do
    a.hours === b.hours && a.minutes === b.minutes
  end
end
