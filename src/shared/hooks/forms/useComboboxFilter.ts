export function useComboboxFilter() {
  const shouldFilterItem = ({
    item,
    inputValue,
  }: {
    item: { value: string; label: string };
    inputValue: string | null;
  }) => {
    if (!inputValue) return true;

    const searchText = inputValue.toLowerCase();
    const label = item.label.toLowerCase();
    const value = item.value.toLowerCase();

    return (
      label.includes(searchText) ||
      value.includes(searchText) ||
      label.split(' ').some((word: string) => word.startsWith(searchText)) ||
      value.split('/').some((part: string) => part.startsWith(searchText))
    );
  };

  return { shouldFilterItem };
}
