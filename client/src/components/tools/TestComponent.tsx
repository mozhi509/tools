import React from 'react';

const TestComponent: React.FC = () => {
  return (
    <div style={{ padding: '20px', background: 'lightblue', margin: '10px' }}>
      <h2>测试组件正常工作!</h2>
      <p>如果你能看到这个蓝色区域，说明React和TypeScript正常工作。</p>
      <button onClick={() => alert('按钮点击正常!')}>点击测试</button>
    </div>
  );
};

export default TestComponent;