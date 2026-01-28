import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import 'antd/dist/reset.css';
import JsonFormatter from './components/tools/JsonFormatter';
import Base64Encoder from './components/tools/Base64Encoder';
import RegexTester from './components/tools/RegexTester';
import TimestampConverter from './components/tools/TimestampConverter';
import UrlParser from './components/tools/UrlParser';
import JwtParser from './components/tools/JwtParser';
import UuidGenerator from './components/tools/UuidGenerator';
import MarkdownEditor from './components/tools/MarkdownEditor';
import ColorConverter from './components/tools/ColorConverter';
import ImageEditor from './components/tools/ImageEditor';
import VideoEditor from './components/tools/VideoEditor';
import DonatePageSimple from './components/DonatePageSimple';


function App() {
  return (
    <Router>
      <div className="App" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/share/:shareId" element={<JsonFormatter />} />
          <Route path="/" element={<JsonFormatter />} />
          <Route path="/json-formatter" element={<JsonFormatter />} />
          <Route path="/json" element={<JsonFormatter />} />
          <Route path="/base64" element={<Base64Encoder />} />
          <Route path="/regex" element={<RegexTester />} />
          <Route path="/timestamp" element={<TimestampConverter />} />
          <Route path="/url" element={<UrlParser />} />
          <Route path="/markdown" element={<MarkdownEditor />} />
          <Route path="/jwt" element={<JwtParser />} />
          <Route path="/uuid" element={<UuidGenerator />} />
          <Route path="/color" element={<ColorConverter />} />
          <Route path="/image-editor" element={<ImageEditor />} />
          <Route path="/video-editor" element={<VideoEditor />} />

          <Route path="/donate" element={<DonatePageSimple />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <footer 
          style={{
            textAlign: 'center',
            padding: '10px',
            fontSize: '12px',
            color: '#666',
            backgroundColor: '#f5f5f5',
            borderTop: '1px solid #e0e0e0',
            marginTop: 'auto'
          }}
        >
          <div>
            <a 
              href="https://beian.miit.gov.cn/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: '#666', 
                textDecoration: 'none',
                cursor: 'pointer'
              }}
            >
              沪ICP备2025152881号
            </a>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;