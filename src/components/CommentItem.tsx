"use client"
import React, { useEffect } from 'react';
import { Heart, Trash } from 'lucide-react';
import { CommentData } from '@/lib/types';
import { getUser } from '@/lib/api';
import { FaHeart } from "react-icons/fa";
import { timeAgo } from '@/lib/utils';


interface CommentItemProps {
    item: CommentData;
    onToggle: (id: string) => void;
    comments: CommentData[];
    parent?: {
        _id: string;
        fullname: string;
        email: string;
    };
    onReply: (parent: { parentId: string, fullname: string, email: string }) => void;
    onLike: (id: string) => void;
    deleteComment: (item: CommentData) => void;
    user: {
        _id: string;
        fullname: string;
        email: string;
    }
}

const CommentItem: React.FC<CommentItemProps> = ({ item, onToggle, comments, parent, onReply, onLike, deleteComment, user }) => {

    const [showReplies, setShowReplies] = React.useState(!item.showReplies ? false : true);

    const [label, setLabel] = React.useState('');

    useEffect(() => {
        setInterval(() => {
            setLabel(timeAgo(item.createdAt)!);
        }, 60000);
        setLabel(timeAgo(item.createdAt)!);
    }, [])

    useEffect(() => {
        if (item.showReplies !== undefined) {
            setShowReplies(item.showReplies);
        }
    }, [item.showReplies]);
    return item.user && (
        <div className="">
            <div className="flex items-start">
                <div className="pr-3">
                    <div className="w-6 h-6 bg-primaryhover rounded-full border text-[10px]  flex items-center justify-center text-white" >
                        {item.user.fullname.charAt(0).toUpperCase()}
                    </div>
                </div>
                <div className="flex flex-1 justify-between">
                    <div>
                        <p className="text-xs font-medium mb-1">{item.user.fullname}</p>
                        <p className="text-xs font-light"> <span className='text-blue-500 text-[10px]'>{parent && `@${parent.fullname}`}</span> {item.text}</p>
                    </div>
                    <div className="pl-8">
                        <div className="flex items-center gap-2 cursor-pointer h-full" onClick={() => onLike(item._id)}>
                            <div className=''>
                                {item.likes.some(item => item === user?._id) ? (
                                    <FaHeart size={12} color="#FF008C" />
                                ) : (
                                    <Heart size={12} className='text-gray-500' />
                                )}
                            </div>
                            <p className="text-[12px] w-2">{item.likes.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pl-11">
                <div className="pt-2 flex items-center gap-4">
                    <p className="text-xs font-light text-gray-400">{label}</p>
                    <p className="text-xs font-light cursor-pointer hover:underline" onClick={() => onReply({ parentId: item._id, fullname: item.user.fullname, email: item.user.email })}>Reply</p>
                    {item.user._id === user?._id && (
                        <Trash size={12} color='red' className='cursor-pointer' onClick={() => deleteComment(item)} />
                    )}
                </div>


            </div>

            <div>
                {item.replies.length > 0 && (
                    <div className="mt-3">
                        {!showReplies ? (
                            <div
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() => setShowReplies(true)}
                            >
                                <div className="w-14 h-[0.2px] bg-black" />
                                <p className="text-xs font-light">View {item.replies.length} replies</p>
                            </div>
                        ) : (
                            <div className="mt-4 border-l border-gray-100  space-y-2">
                                {item.replies.map((reply) => {
                                    const findParentUser = (list: CommentData[], parentId: string): CommentData['user'] | undefined => {
                                        for (const comment of list) {
                                            if (comment._id === parentId) return comment.user;
                                            if (comment.replies.length > 0) {
                                                const found = findParentUser(comment.replies, parentId);
                                                if (found) return found;
                                            }
                                        }
                                        return undefined;
                                    };

                                    const repliedTo = findParentUser(comments, reply.parentId!);
                                    return <CommentItem
                                        key={reply._id}
                                        item={reply}
                                        onToggle={onToggle}
                                        comments={comments}
                                        parent={repliedTo}
                                        onReply={onReply}
                                        onLike={onLike}
                                        deleteComment={deleteComment}
                                        user={user}

                                    />
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentItem;