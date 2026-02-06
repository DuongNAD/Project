import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { commentApi, commentList, timeAgo, url } from "../../api/function";

const getAvatarUrl = (path) => {
  if (!path) return "https://via.placeholder.com/150";
  return path.startsWith("http") ? path : url + path;
};

const CommentForm = ({ onAddComment }) => {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onAddComment(text);
      setText("");
    } else {
      toast.error("You have not written comment content");
    }
  };

  return (
    <form
      className="w-full border rounded-2xl shadow-sm p-5 mb-8 bg-white dark:bg-gray-800 dark:border-gray-700 transition-colors duration-300"
      onSubmit={handleSubmit}
    >
      <textarea
        className="w-full border rounded-xl p-4 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition-colors"
        placeholder="Share your thoughts about this place..."
        value={text}
        rows="3"
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex justify-end">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-full transition shadow-md"
          type="submit"
        >
          Post Comment
        </button>
      </div>
    </form>
  );
};

const CommentItem = ({ comment }) => {
  return (
    <div className="flex items-start gap-4 border-b border-gray-100 dark:border-gray-700 p-4 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors">
      <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 dark:border-gray-600 shrink-0">
        <img
          src={getAvatarUrl(comment?.account?.avata)}
          alt="Avatar"
          className="w-full h-full object-cover"
          onError={(e) => {e.target.onerror = null; e.target.src="https://via.placeholder.com/150?text=U"}}
        />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="font-bold text-gray-900 dark:text-gray-100">
            {comment?.account?.full_name || "Unknown"}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {timeAgo(comment.created_at)}
          </span>
        </div>
        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
            {comment.message}
        </p>
      </div>
    </div>
  );
};

const CommentList = ({ comments }) => {
  if (!comments || comments.length === 0) {
    return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            No comments yet. Be the first to verify this location!
        </div>
    );
  }

  return (
    <div className="space-y-2 w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
};

function CommentSection({ idBeaches }) {
  const navigate = useNavigate();
  const [initialComments, setInitComment] = useState([]);

  useEffect(() => {
    if(idBeaches) fetchDataComment();
  }, [idBeaches]);

  const fetchDataComment = async () => {
    try {
      const rs = await commentList(idBeaches);
      setInitComment(rs?.data?.data || []);
    } catch (error) { setInitComment([]); }
  };

  const handleAddComment = async (text) => {
    if (!localStorage.getItem("token")) {
      navigate("/login-account");
      return;
    }
    // Check role cũ của anh
    if (localStorage.getItem("role") != 2) {
       toast.error("You don't have permission.");
       return;
    }
    try {
      const data = { beach_id: idBeaches, message: text };
      await commentApi(data);
      fetchDataComment();
      toast.success("Success!");
    } catch (error) {}
  };

  return (
    <div className="w-full mt-6">
      {localStorage.getItem("token") && localStorage.getItem("role") == 2 ? (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-white">
            <span>💬</span> Share your experience
          </h2>
          <CommentForm onAddComment={handleAddComment} />
        </section>
      ) : null}
      
      <section>
        <h2 className="text-xl font-bold mb-4 dark:text-white">
            Reviews ({initialComments.length})
        </h2>
        <CommentList comments={initialComments} />
      </section>
    </div>
  );
}

export default CommentSection;