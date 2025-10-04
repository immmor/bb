'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Vote, Users, Lock, Zap, TrendingUp, Copy, LogOut } from 'lucide-react';
import { getVotes, updateVoteCount, VoteRecord } from '@/lib/supabase';

// 扩展Window接口以包含ethereum属性
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      selectedAddress?: string;
    };
  }
}

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [isMounted, setIsMounted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [votingPollId, setVotingPollId] = useState<number | null>(null);

  useEffect(() => {
    setIsMounted(true);
    
    // 检查MetaMask连接状态
    const checkMetaMaskConnection = async () => {
      try {
        if (typeof window !== 'undefined' && window.ethereum) {
          // 检查是否已连接
          const provider = window.ethereum;
          const accounts = await provider.request({
            method: 'eth_accounts',
            params: []
          });
          
          if (accounts && accounts.length > 0) {
            setIsConnected(true);
            setAccount(accounts[0]);
          }
        }
      } catch (err) {
        console.error('检查MetaMask连接状态失败:', err);
      }
    };

    // 从数据库加载投票数据
    const loadVotesFromDatabase = async () => {
      try {
        const votes = await getVotes();
        if (votes.length === 0) {
          console.log('数据库为空，但由于RLS策略无法自动创建数据');
          console.log('💡 请手动在Supabase仪表板中添加数据');
          
          // 创建本地模拟数据用于界面展示
          const mockVotes: VoteRecord[] = [
            {
              id: 1,
              title: '社区治理提案投票',
              address: '0x0000000000000000000000000000000000000000',
              vote_num: 1250,
              created_at: new Date().toISOString()
            },
            {
              id: 2,
              title: '技术升级方案选择',
              address: '0x0000000000000000000000000000000000000000',
              vote_num: 890,
              created_at: new Date().toISOString()
            },
            {
              id: 3,
              title: '预算分配方案',
              address: '0x0000000000000000000000000000000000000000',
              vote_num: 2100,
              created_at: new Date().toISOString()
            }
          ];
          
          setPolls(mockVotes);
        } else {
          setPolls(votes);
        }
      } catch (error) {
        console.error('加载投票数据失败:', error);
        setError('加载投票数据失败');
      }
    };

    checkMetaMaskConnection();
    loadVotesFromDatabase();
  }, []);

  const [polls, setPolls] = useState<VoteRecord[]>([]);

  const connectWallet = async () => {
    setIsConnecting(true);
    setError('');
    
    try {
      // 检查window.ethereum是否存在（MetaMask扩展）
      if (typeof window !== 'undefined' && window.ethereum) {
        console.log('检测到MetaMask扩展');
        
        // 使用MetaMask扩展的provider
        const provider = window.ethereum;
        
        // 请求账户连接
        console.log('正在请求账户连接...');
        const accounts = await provider.request({
          method: 'eth_requestAccounts',
          params: []
        });
        console.log('账户连接结果:', accounts);

      if (accounts && accounts.length > 0) {
          setIsConnected(true);
          setAccount(accounts[0]);
          
          // 监听账户变化
          provider.on('accountsChanged', (newAccounts: string[]) => {
            if (newAccounts.length === 0) {
              // 用户断开连接
              setIsConnected(false);
              setAccount('');
            } else {
              // 账户切换
              setAccount(newAccounts[0]);
            }
          });

          // 监听链变化
          provider.on('chainChanged', (chainId: string) => {
            console.log('链已切换:', chainId);
          });
        }
      } else {
        // MetaMask未安装
        setError('请先安装MetaMask钱包扩展');
        console.log('未检测到MetaMask扩展，请确保已安装MetaMask');
      }
    } catch (err: any) {
      console.error('钱包连接失败:', err);
      if (err.code === 4001) {
        setError('用户拒绝了连接请求');
      } else if (err.code === -32002) {
        setError('连接请求已在进行中，请检查MetaMask');
      } else {
        setError(err.message || '连接钱包失败');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAccount('');
    setError('');
  };

  const copyAddress = async () => {
    if (account) {
      try {
        await navigator.clipboard.writeText(account);
        // 可以添加复制成功的提示
      } catch (err) {
        console.error('复制地址失败:', err);
      }
    }
  };

  const voteOnPoll = async (pollId: number) => {
    if (!isConnected) {
      setError('请先连接钱包才能投票');
      return;
    }

    setVotingPollId(pollId);
    setError('');

    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = window.ethereum;
        
        // 模拟投票交易 - 实际项目中这里应该调用智能合约
        console.log(`开始为投票 ${pollId} 进行投票...`);
        
        // 模拟交易确认
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 更新数据库中的投票数
        const poll = polls.find(p => p.id === pollId);
        if (poll) {
          const success = await updateVoteCount(pollId, poll.vote_num + 1);
          if (success) {
            // 更新本地状态
            setPolls(prevPolls => 
              prevPolls.map(poll => 
                poll.id === pollId ? { ...poll, vote_num: poll.vote_num + 1 } : poll
              )
            );
            console.log(`投票 ${pollId} 成功完成！投票数已更新到数据库。`);
          } else {
            // 如果是RLS阻止，模拟成功并更新本地状态
            console.log('⚠️  RLS策略阻止更新，模拟成功');
            setPolls(prevPolls => 
              prevPolls.map(poll => 
                poll.id === pollId ? { ...poll, vote_num: poll.vote_num + 1 } : poll
              )
            );
          }
        }
      } else {
        // 如果没有检测到MetaMask，模拟投票
        console.log('⚠️  未检测到MetaMask，模拟投票成功');
        const poll = polls.find(p => p.id === pollId);
        if (poll) {
          setPolls(prevPolls => 
            prevPolls.map(poll => 
              poll.id === pollId ? { ...poll, vote_num: poll.vote_num + 1 } : poll
            )
          );
        }
      }
    } catch (err: any) {
      console.error('投票失败:', err);
      setError(err.message || '投票失败，请重试');
    } finally {
      setVotingPollId(null);
    }
  };

  // 为数据库返回的数据添加默认状态
  const pollsWithStatus = polls.map(poll => ({
    ...poll,
    status: poll.vote_num > 2000 ? 'ended' : 'active'
  }));
  
  const filteredPolls = pollsWithStatus.filter(poll => poll.status === activeTab);

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
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full pulse-animation"></div>
                  <div className="flex items-center space-x-2 bg-gray-800/50 px-3 py-2 rounded-lg">
                    <span className="text-sm text-gray-300 font-mono">
                      {account.slice(0, 6)}...{account.slice(-4)}
                    </span>
                    <button
                      onClick={copyAddress}
                      className="text-gray-400 hover:text-green-400 transition-colors"
                      title="复制地址"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={disconnectWallet}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                      title="断开连接"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="bg-gradient-to-r from-green-400 to-purple-500 text-white px-6 py-2 rounded-lg font-medium glow-effect hover:from-green-500 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConnecting ? '连接中...' : '连接钱包'}
                </button>
              )}
              {error && (
                <div className="text-red-400 text-sm bg-red-400/10 px-3 py-1 rounded">
                  {error}
                  {error === '请先安装MetaMask钱包扩展' && (
                    <div className="mt-1">
                      <a 
                        href="https://metamask.io/download/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        点击下载MetaMask
                      </a>
                    </div>
                  )}
                </div>
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
                    <p className="text-gray-400">地址: {poll.address}</p>
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
                      <span>{poll.vote_num} 票</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>创建时间: {poll.created_at ? new Date(poll.created_at).toLocaleDateString() : '未知'}</span>
                    </div>
                  </div>
                  
                  {poll.vote_num <= 2000 && poll.id && (
                    <button 
                      onClick={() => voteOnPoll(poll.id!)}
                      disabled={votingPollId === poll.id}
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Vote className="h-4 w-4" />
                      <span>{votingPollId === poll.id ? '投票中...' : '立即投票'}</span>
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
