#!/usr/bin/env node

// 简单的API测试脚本
const fetch = require('node-fetch');

async function testAPI() {
    console.log('🧪 测试JSON格式化API...\n');
    
    try {
        // 测试格式化API
        console.log('📝 测试格式化功能...');
        const formatResponse = await fetch('http://localhost:3001/api/tools/json/format', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                json: '{"name":"test","age":25}',
                indent: 2
            })
        });
        
        if (formatResponse.ok) {
            const formatData = await formatResponse.json();
            console.log('✅ 格式化API正常:', formatData.success);
        } else {
            console.log('❌ 格式化API错误:', formatResponse.status);
        }
        
        // 测试验证API
        console.log('🔍 测试验证功能...');
        const validateResponse = await fetch('http://localhost:3001/api/tools/json/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                json: '{"name":"test","age":25}'
            })
        });
        
        if (validateResponse.ok) {
            const validateData = await validateResponse.json();
            console.log('✅ 验证API正常:', validateData.success, '有效:', validateData.valid);
        } else {
            console.log('❌ 验证API错误:', validateResponse.status);
        }
        
        // 测试压缩API
        console.log('🗜️ 测试压缩功能...');
        const minifyResponse = await fetch('http://localhost:3001/api/tools/json/minify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                json: '{"name":"test","age":25,"data":{"nested":true}}'
            })
        });
        
        if (minifyResponse.ok) {
            const minifyData = await minifyResponse.json();
            console.log('✅ 压缩API正常:', minifyData.success);
        } else {
            console.log('❌ 压缩API错误:', minifyResponse.status);
        }
        
        // 测试健康检查
        console.log('🏥 测试健康检查...');
        const healthResponse = await fetch('http://localhost:3001/api/health');
        if (healthResponse.ok) {
            const healthData = await healthResponse.json();
            console.log('✅ 健康检查正常:', healthData.status);
        } else {
            console.log('❌ 健康检查失败:', healthResponse.status);
        }
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        console.log('💡 请确保后端服务器在 http://localhost:3001 运行');
    }
}

testAPI();