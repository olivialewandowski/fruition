import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R, T> {
      toBeInTheDocument(): R;
      toHaveTextContent(text: string): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toBeChecked(): R;
      toBeEmpty(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveClass(className: string): R;
      toHaveFocus(): R;
      toHaveStyle(style: Record<string, any>): R;
      toHaveValue(value: string | string[] | number): R;
      toBeRequired(): R;
      toBeValid(): R;
      toBeInvalid(): R;
      toContainElement(element: HTMLElement | null): R;
      toContainHTML(htmlText: string): R;
    }
  }
} 