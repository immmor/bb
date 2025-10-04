'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Vote, Users, Lock, Zap, TrendingUp } from 'lucide-react';

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const polls = [
    {
      id: 1,
      title: '社区治理提案投票',
      description: '决定是否实施新的社区治理机制',
      votes: 1250,
      endDate: '2024-12-31',
      status: 'active'
    },
    {
      id: 2,
      title: '技术升级方案选择',
      description: '选择下一阶段的技术升级方向',
      votes: 890,
      endDate: '2024-12-25',
      status: 'active'
    },
    {
      id: 3,
      title: '预算分配方案',
      description: '决定下一季度预算的分配比例',
      votes: 2100,
      endDate: '2024-11-30',
      status: 'ended'
    }
  ];

  const connectWallet = async () => {
    // 模拟钱包连接
    setIsConnected(true);
    setAccount('0x742d35Cc6634C0532925a3b8...');
  };

  const filteredPolls = polls.filter(poll => poll.status === activeTab);

  return (
    <div className="min-h-screen blockchain-grid">
      {/* 导航栏 */}
      <nav className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-green-400" />
              <span className="text-2xl font-bold gradient-text">BlockVote</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {!isMounted ? (
                <div className="w-32 h-10 bg-gray-700 rounded-lg animate-pulse"></div>
              ) : isConnected ? (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full pulse-animation"></div>
                  <span className="text-sm text-gray-300">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </span>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="bg-gradient-to-r from-green-400 to-purple-500 text-white px-6 py-2 rounded-lg font-medium glow-effect hover:from-green-500 hover:to-purple-600 transition-all duration-300"
                >
                  连接钱包
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 英雄区块 */}
        <motion.div
          initial={isMounted ? { opacity: 0, y: 50 } : false}
          animate={isMounted ? { opacity: 1, y: 0 } : false}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="gradient-text">区块链投票</span>
            <br />
            <span className="text-white">安全透明</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            基于区块链技术的去中心化投票平台，确保每一票都安全、透明、不可篡改
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {[
              { icon: Lock, title: '安全可靠', desc: '区块链技术保障投票安全' },
              { icon: Shield, title: '透明公正', desc: '所有投票记录公开可查' },
              { icon: Zap, title: '高效便捷', desc: '快速完成投票过程' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={isMounted ? { opacity: 0, y: 30 } : false}
                animate={isMounted ? { opacity: 1, y: 0 } : false}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800"
              >
                <item.icon className="h-12 w-12 text-green-400 mb-4 mx-auto" />
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 投票列表 */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white">正在进行中的投票</h2>
            <div className="flex space-x-2">
              {['active', 'ended'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {tab === 'active' ? '进行中' : '已结束'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6">
            {filteredPolls.map((poll, index) => (
              <motion.div
                key={poll.id}
                initial={isMounted ? { opacity: 0, x: -50 } : false}
                animate={isMounted ? { opacity: 1, x: 0 } : false}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-green-400/50 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{poll.title}</h3>
                    <p className="text-gray-400">{poll.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    poll.status === 'active' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-gray-600 text-gray-300'
                  }`}>
                    {poll.status === 'active' ? '进行中' : '已结束'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{poll.votes} 票</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>截止: {poll.endDate}</span>
                    </div>
                  </div>
                  
                  {poll.status === 'active' && (
                    <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-300">
                      <Vote className="h-4 w-4" />
                      <span>立即投票</span>
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="border-t border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p>© 2024 BlockVote - 基于区块链的去中心化投票平台</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
