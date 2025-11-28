export interface ThemeColors {
  name: string;
  background: string;
  foreground: string;
  header: string;
  border: string;
  button: string;
  string: string;
  number: string;
  boolean: string;
  key: string;
  bracket: string;
  comma: string;
  placeholder: string;
  buttonForeground?: string;
}

export const themes: { [key: string]: ThemeColors } = {
  'vs-dark': {
    name: 'VS Code Dark',
    background: '#1e1e1e',
    foreground: '#d4d4d4',
    header: '#252526',
    border: '#3e3e42',
    button: '#1f6feb',
    string: '#ce9178',
    number: '#b5cea8',
    boolean: '#569cd6',
    key: '#9cdcfe',
    bracket: '#c586c0',
    comma: '#d4d4d4',
    placeholder: '#8b949e',
    buttonForeground: '#ffffff'
  },
  'github-dark': {
    name: 'GitHub Dark',
    background: '#0d1117',
    foreground: '#c9d1d9',
    header: '#161b22',
    border: '#30363d',
    button: '#238636',
    string: '#a5d6ff',
    number: '#79c0ff',
    boolean: '#ff7b72',
    key: '#7ee787',
    bracket: '#d2a8ff',
    comma: '#8b949e',
    placeholder: '#8b949e',
    buttonForeground: '#ffffff'
  },
  'monokai': {
    name: 'Monokai',
    background: '#272822',
    foreground: '#f8f8f2',
    header: '#3e3d32',
    border: '#75715e',
    button: '#66d9ef',
    string: '#e6db74',
    number: '#ae81ff',
    boolean: '#ae81ff',
    key: '#66d9ef',
    bracket: '#f92672',
    comma: '#75715e',
    placeholder: '#75715e',
    buttonForeground: '#000000'
  },
  'dracula': {
    name: 'Dracula',
    background: '#282a36',
    foreground: '#f8f8f2',
    header: '#44475a',
    border: '#6272a4',
    button: '#bd93f9',
    string: '#f1fa8c',
    number: '#50fa7b',
    boolean: '#ff79c6',
    key: '#8be9fd',
    bracket: '#ff79c6',
    comma: '#6272a4',
    placeholder: '#6272a4',
    buttonForeground: '#ffffff'
  },
  'solarized-dark': {
    name: 'Solarized Dark',
    background: '#002b36',
    foreground: '#839496',
    header: '#073642',
    border: '#657b83',
    button: '#268bd2',
    string: '#2aa198',
    number: '#2aa198',
    boolean: '#d33682',
    key: '#268bd2',
    bracket: '#859900',
    comma: '#657b83',
    placeholder: '#586e75',
    buttonForeground: '#ffffff'
  },
  'vs-light': {
    name: 'VS Code Light',
    background: '#ffffff',
    foreground: '#000000',
    header: '#f3f3f3',
    border: '#e1e1e1',
    button: '#0078d4',
    string: '#a31515',
    number: '#098658',
    boolean: '#0000ff',
    key: '#0451a5',
    bracket: '#000000',
    comma: '#000000',
    placeholder: '#6e6e6e',
    buttonForeground: '#ffffff'
  },
  'vs-high-contrast': {
    name: 'VS Code High Contrast',
    background: '#000000',
    foreground: '#ffffff',
    header: '#1a1a1a',
    border: '#ffffff',
    button: '#1a85ff',
    string: '#ce9178',
    number: '#b5cea8',
    boolean: '#569cd6',
    key: '#9cdcfe',
    bracket: '#ffd700',
    comma: '#ffffff',
    placeholder: '#ffffff',
    buttonForeground: '#000000'
  },
  'facebook': {
    name: 'Facebook',
    background: '#ffffff',
    foreground: '#1c1e21',
    header: '#f0f2f5',
    border: '#dddfe2',
    button: '#1877f2',
    string: '#0366d6',
    number: '#0550ae',
    boolean: '#1877f2',
    key: '#65676b',
    bracket: '#1c1e21',
    comma: '#606770',
    placeholder: '#8a8d91',
    buttonForeground: '#ffffff'
  }
};

export const getThemeColors = (themeName: string): ThemeColors => {
  return themes[themeName] || themes['vs-light'];
};