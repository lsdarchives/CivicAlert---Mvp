
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { apiRequest } from "../services/api";

type CommentItem = {
  id: number;
  reportId: number;
  author: string;
  content: string;
  createdAt: string;
};

type ReactionCounts = {
  LIKE: number;
  SUPPORT: number;
  IMPORTANT: number;
};

type ReactionData = {
  counts: ReactionCounts;
  myReaction: string | null;
};

type Props = {
  reportId: number;
  token: string;
};

const REACTIONS = [
  { type: "LIKE", label: "👍 Like" },
  { type: "SUPPORT", label: "🤝 Support" },
  { type: "IMPORTANT", label: "❗ Important" },
] as const;

export default function ReportDiscussion({ reportId, token }: Props) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [reactionData, setReactionData] = useState<ReactionData>({
    counts: { LIKE: 0, SUPPORT: 0, IMPORTANT: 0 },
    myReaction: null,
  });
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [reacting, setReacting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadDiscussion = useCallback(async () => {
    setError("");

    try {
      const [commentResult, reactionResult] = await Promise.all([
        apiRequest(`/reports/${reportId}/comments`, "GET", undefined, token),
        apiRequest(`/reports/${reportId}/reactions`, "GET", undefined, token),
      ]);

      setComments(Array.isArray(commentResult) ? commentResult : []);

      setReactionData({
        counts: {
          LIKE: Number(reactionResult?.counts?.LIKE ?? 0),
          SUPPORT: Number(reactionResult?.counts?.SUPPORT ?? 0),
          IMPORTANT: Number(reactionResult?.counts?.IMPORTANT ?? 0),
        },
        myReaction: reactionResult?.myReaction ?? null,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load the discussion."
      );
    } finally {
      setLoading(false);
    }
  }, [reportId, token]);

  useEffect(() => {
    void loadDiscussion();
  }, [loadDiscussion]);

  async function postComment() {
    const content = commentText.trim();

    if (!content) {
      setError("Write a comment before posting.");
      return;
    }

    if (content.length > 2000) {
      setError("Your comment must be 2000 characters or fewer.");
      return;
    }

    setPosting(true);
    setError("");
    setMessage("");

    try {
      await apiRequest(
        `/reports/${reportId}/comments`,
        "POST",
        { content },
        token
      );

      setCommentText("");
      setMessage("Comment posted successfully.");
      await loadDiscussion();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not post your comment."
      );
    } finally {
      setPosting(false);
    }
  }

  async function toggleReaction(type: string) {
    setReacting(true);
    setError("");
    setMessage("");

    const previousReaction = reactionData.myReaction;

    try {
      if (previousReaction === type) {
        await apiRequest(
          `/reports/${reportId}/reactions`,
          "DELETE",
          undefined,
          token
        );
      } else {
        await apiRequest(
          `/reports/${reportId}/reactions`,
          "PUT",
          { reactionType: type },
          token
        );
      }

      await loadDiscussion();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save your reaction."
      );
    } finally {
      setReacting(false);
    }
  }

  function formatDate(value: string) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleString();
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#287A55" />
        <Text style={styles.muted}>Loading community discussion...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Community discussion</Text>
      <Text style={styles.subtitle}>
        Share useful information and show support for this report.
      </Text>

      <View style={styles.reactionContainer}>
        {REACTIONS.map((reaction) => {
          const selected = reactionData.myReaction === reaction.type;
          const count =
            reactionData.counts[
              reaction.type as keyof ReactionCounts
            ];

          return (
            <Pressable
              key={reaction.type}
              accessibilityRole="button"
              accessibilityState={{ selected, disabled: reacting }}
              disabled={reacting}
              onPress={() => void toggleReaction(reaction.type)}
              style={[
                styles.reactionButton,
                selected && styles.reactionSelected,
                reacting && styles.disabled,
              ]}
            >
              <Text
                style={[
                  styles.reactionText,
                  selected && styles.reactionTextSelected,
                ]}
              >
                {reaction.label} {count}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.commentForm}>
        <Text style={styles.formHeading}>Add a comment</Text>

        <TextInput
          value={commentText}
          onChangeText={setCommentText}
          placeholder="Share an update or helpful information..."
          placeholderTextColor="#87948C"
          multiline
          maxLength={2000}
          editable={!posting}
          style={styles.input}
          accessibilityLabel="Write a community comment"
        />

        <Text style={styles.characterCount}>
          {commentText.length}/2000
        </Text>

        <Pressable
          accessibilityRole="button"
          disabled={posting || !commentText.trim()}
          onPress={() => void postComment()}
          style={({ pressed }) => [
            styles.postButton,
            (posting || !commentText.trim()) && styles.disabled,
            pressed && styles.pressed,
          ]}
        >
          {posting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.postButtonText}>Post comment</Text>
          )}
        </Pressable>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {message ? <Text style={styles.success}>{message}</Text> : null}

      <View style={styles.commentsHeader}>
        <Text style={styles.formHeading}>Comments</Text>

        <Pressable
          accessibilityRole="button"
          onPress={() => void loadDiscussion()}
          style={styles.refreshButton}
        >
          <Text style={styles.refreshText}>Refresh</Text>
        </Pressable>
      </View>

      {comments.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No comments yet</Text>
          <Text style={styles.muted}>
            Be the first to share a helpful update.
          </Text>
        </View>
      ) : (
        comments.map((comment) => (
          <View key={comment.id} style={styles.commentCard}>
            <View style={styles.commentTopRow}>
              <Text style={styles.author}>
                {comment.author || "Community member"}
              </Text>
              <Text style={styles.date}>
                {formatDate(comment.createdAt)}
              </Text>
            </View>

            <Text style={styles.commentContent}>{comment.content}</Text>
          </View>
        ))
      )}

      {reacting ? (
        <Text style={styles.muted}>Saving reaction...</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2EAE5",
    padding: 16,
  },
  loadingContainer: {
    padding: 28,
    alignItems: "center",
    gap: 10,
  },
  heading: {
    fontSize: 21,
    fontWeight: "800",
    color: "#173D32",
  },
  subtitle: {
    color: "#66756E",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 16,
  },
  reactionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 22,
  },
  reactionButton: {
    borderWidth: 1,
    borderColor: "#DCE6DF",
    backgroundColor: "#F7FAF8",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  reactionSelected: {
    borderColor: "#287A55",
    backgroundColor: "#E5F3E9",
  },
  reactionText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#43554A",
  },
  reactionTextSelected: {
    color: "#236442",
  },
  commentForm: {
    backgroundColor: "#F6F9F7",
    borderRadius: 12,
    padding: 12,
  },
  formHeading: {
    fontSize: 16,
    fontWeight: "800",
    color: "#24372E",
  },
  input: {
    minHeight: 100,
    maxHeight: 180,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE6DF",
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    color: "#24372E",
    textAlignVertical: "top",
  },
  characterCount: {
    textAlign: "right",
    color: "#748179",
    fontSize: 11,
    marginTop: 5,
  },
  postButton: {
    backgroundColor: "#287A55",
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  postButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
  commentsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 12,
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#E5F3E9",
  },
  refreshText: {
    color: "#236442",
    fontSize: 12,
    fontWeight: "800",
  },
  emptyState: {
    padding: 18,
    alignItems: "center",
    backgroundColor: "#F7FAF8",
    borderRadius: 10,
  },
  emptyTitle: {
    color: "#24372E",
    fontWeight: "700",
    marginBottom: 6,
  },
  muted: {
    color: "#748179",
    fontSize: 13,
  },
  commentCard: {
    borderTopWidth: 1,
    borderTopColor: "#E8EEEA",
    paddingVertical: 14,
  },
  commentTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  author: {
    color: "#236442",
    fontSize: 13,
    fontWeight: "800",
    flex: 1,
  },
  date: {
    color: "#87948C",
    fontSize: 10,
    flexShrink: 1,
    textAlign: "right",
  },
  commentContent: {
    color: "#34483C",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  error: {
    color: "#A52C2C",
    backgroundColor: "#FDECEC",
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
    fontSize: 13,
  },
  success: {
    color: "#236442",
    backgroundColor: "#E5F3E9",
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
    fontSize: 13,
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.8,
  },
});
