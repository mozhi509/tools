import { getThemeColors, themes } from './themes';

describe('themes', () => {
  it('defines vs-light', () => {
    expect(themes['vs-light']).toBeDefined();
    expect(themes['vs-light'].background).toMatch(/^#/);
  });

  it('getThemeColors returns palette', () => {
    const t = getThemeColors('vs-light');
    expect(t.foreground).toBeDefined();
    expect(t.border).toBeDefined();
  });

  it('falls back to vs-light for unknown name', () => {
    const t = getThemeColors('non-existent-theme-xyz');
    expect(t.name).toBe(themes['vs-light'].name);
  });
});
