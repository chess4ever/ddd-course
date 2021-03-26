defmodule Customer do
  @enforce_keys [:name]
  defstruct [:name]

  def new(name) do
    %__MODULE__{name: name}
  end
end
