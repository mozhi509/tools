import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import JsonFormatter from '../components/tools/JsonFormatter';

// Mock fetch API
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('JsonFormatter Component', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  test('renders JSON formatter interface', () => {
    render(<JsonFormatter />);
    
    expect(screen.getByText('📄 JSON 格式化工具 (完整版)')).toBeInTheDocument();
    expect(screen.getByText('输入 JSON:')).toBeInTheDocument();
    expect(screen.getByText('输出结果:')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请输入JSON数据')).toBeInTheDocument();
  });

  test('loads sample data when clicking sample button', () => {
    render(<JsonFormatter />);
    
    const sampleButton = screen.getByText('📄 示例');
    fireEvent.click(sampleButton);
    
    const textarea = screen.getByPlaceholderText('请输入JSON数据') as HTMLTextAreaElement;
    expect(textarea.value).toContain('Web工具集');
    expect(textarea.value).toContain('version');
  });

  test('formats JSON successfully', async () => {
    const mockResponse = {
      success: true,
      formatted: '{\n  "name": "test",\n  "value": 123\n}',
      original: '{"name":"test","value":123}'
    };
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    render(<JsonFormatter />);
    
    const textarea = screen.getByPlaceholderText('请输入JSON数据') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: '{"name":"test","value":123}' } });

    const formatButton = screen.getByText('⚡ 格式化');
    fireEvent.click(formatButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/tools/json/format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          json: '{"name":"test","value":123}',
          indent: 2
        })
      });
    });

    await waitFor(() => {
      expect(screen.getByText('✅ JSON格式正确')).toBeInTheDocument();
    });
  });

  test('handles JSON format error', async () => {
    const mockResponse = {
      success: false,
      error: 'JSON格式错误'
    };
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    render(<JsonFormatter />);
    
    const textarea = screen.getByPlaceholderText('请输入JSON数据') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'invalid json' } });

    const formatButton = screen.getByText('⚡ 格式化');
    fireEvent.click(formatButton);

    await waitFor(() => {
      expect(screen.getByText('❌ JSON格式错误: JSON格式错误')).toBeInTheDocument();
    });
  });

  test('validates JSON correctly', async () => {
    const mockResponse = {
      success: true,
      valid: true,
      message: 'JSON格式正确'
    };
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    render(<JsonFormatter />);
    
    const textarea = screen.getByPlaceholderText('请输入JSON数据') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: '{"valid": true}' } });

    const validateButton = screen.getByText('✅ 验证');
    fireEvent.click(validateButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/tools/json/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          json: '{"valid": true}'
        })
      });
    });

    await waitFor(() => {
      expect(screen.getByText('✅ JSON格式正确')).toBeInTheDocument();
    });
  });

  test('minifies JSON correctly', async () => {
    const mockResponse = {
      success: true,
      minified: '{"name":"test","value":123}',
      original: '{\n  "name": "test",\n  "value": 123\n}'
    };
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    render(<JsonFormatter />);
    
    const textarea = screen.getByPlaceholderText('请输入JSON数据') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: '{\n  "name": "test",\n  "value": 123\n}' } });

    const minifyButton = screen.getByText('🗜️ 压缩');
    fireEvent.click(minifyButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/tools/json/minify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          json: '{\n  "name": "test",\n  "value": 123\n}'
        })
      });
    });

    await waitFor(() => {
      expect(screen.getByText('压缩结果:')).toBeInTheDocument();
    });
  });

  test('clears all fields when clicking clear button', () => {
    render(<JsonFormatter />);
    
    // First load some sample data
    const sampleButton = screen.getByText('📄 示例');
    fireEvent.click(sampleButton);

    const clearButton = screen.getByText('🗑️ 清空');
    fireEvent.click(clearButton);

    const textarea = screen.getByPlaceholderText('请输入JSON数据') as HTMLTextAreaElement;
    expect(textarea.value).toBe('');
  });

  test('changes indent size', () => {
    render(<JsonFormatter />);
    
    const indentSelect = screen.getByDisplayValue('2 空格');
    fireEvent.change(indentSelect, { target: { value: 4 } });

    expect((indentSelect as HTMLSelectElement).value).toBe('4');
  });
});