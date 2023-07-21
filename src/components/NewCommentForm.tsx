import React, { useState } from 'react';
import classNames from 'classnames';
import { CommentData } from '../types/Comment';
import { Error, ErrorForm } from '../types/Error';
import { postComment } from '../api/comments';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { changeErrorComment, addComment } from '../features/comments';

const initialNewComment: CommentData = {
  name: '',
  email: '',
  body: '',
};

const initialErrorForm: ErrorForm = {
  name: false,
  email: false,
  body: false,
};

export const NewCommentForm = () => {
  const dispatch = useAppDispatch();
  const { selectedPost } = useAppSelector(state => state.selectedPost);
  const [newComment, setNewComment] = useState(initialNewComment);
  const [loaded, setLoaded] = useState(false);
  const [errorForm, setErrorForm] = useState(initialErrorForm);

  const handleChangeComment = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    setNewComment({ ...newComment, [name]: value });
    setErrorForm({ ...errorForm, [name]: false });
  };

  const handleSubmitComment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedComment = Object.keys(newComment)
      .reduce((acc, key) => {
        return { ...acc, [key]: newComment[key as keyof CommentData].trim() };
      }, {} as CommentData);

    const { name, email, body } = trimmedComment;

    setErrorForm({
      name: !name,
      email: !email,
      body: !body,
    });

    if (!name || !email || !body) {
      return;
    }

    setLoaded(true);

    if (selectedPost) {
      const newId = +Date.now().toString().substring(5);

      const comment = {
        ...trimmedComment,
        id: newId,
        postId: selectedPost.id,
      };

      postComment(selectedPost.id, comment)
        .then(() => {
          dispatch(addComment(comment));
        })
        .catch(() => dispatch(changeErrorComment(Error.AddComment)))
        .finally(() => {
          setNewComment({ ...newComment, body: '' });
          setLoaded(false);
        });
    }
  };

  const handleClearForm = () => {
    setNewComment(initialNewComment);
    setErrorForm(initialErrorForm);
  };

  return (
    <form data-cy="NewCommentForm" onSubmit={handleSubmitComment}>
      <div className="field" data-cy="NameField">
        <label className="label" htmlFor="comment-author-name">
          Author Name
        </label>

        <div className="control has-icons-left has-icons-right">
          <input
            type="text"
            name="name"
            id="comment-author-name"
            placeholder="Name Surname"
            className={classNames(
              'input',
              {
                'is-danger': errorForm.name,
              },
            )}
            value={newComment.name}
            onChange={handleChangeComment}
          />

          <span className="icon is-small is-left">
            <i className="fas fa-user" />
          </span>

          {errorForm.name && (
            <>
              <span
                className="icon is-small is-right has-text-danger"
                data-cy="ErrorIcon"
              >
                <i className="fas fa-exclamation-triangle" />
              </span>

              <p className="help is-danger" data-cy="ErrorMessage">
                Name is required
              </p>
            </>
          )}
        </div>
      </div>

      <div className="field" data-cy="EmailField">
        <label className="label" htmlFor="comment-author-email">
          Author Email
        </label>

        <div className="control has-icons-left has-icons-right">
          <input
            type="text"
            name="email"
            id="comment-author-email"
            placeholder="email@test.com"
            className={classNames(
              'input',
              {
                'is-danger': errorForm.email,
              },
            )}
            value={newComment.email}
            onChange={handleChangeComment}
          />

          <span className="icon is-small is-left">
            <i className="fas fa-envelope" />
          </span>

          {errorForm.email && (
            <>
              <span
                className="icon is-small is-right has-text-danger"
                data-cy="ErrorIcon"
              >
                <i className="fas fa-exclamation-triangle" />
              </span>

              <p className="help is-danger" data-cy="ErrorMessage">
                Email is required
              </p>
            </>
          )}
        </div>
      </div>

      <div className="field" data-cy="BodyField">
        <label className="label" htmlFor="comment-body">
          Comment Text
        </label>

        <div className="control">
          <textarea
            id="comment-body"
            name="body"
            placeholder="Type comment here"
            className={classNames(
              'textarea',
              {
                'is-danger': errorForm.body,
              },
            )}
            value={newComment.body}
            onChange={handleChangeComment}
          />
        </div>

        {errorForm.body && (
          <p className="help is-danger" data-cy="ErrorMessage">
            Enter some text
          </p>
        )}
      </div>

      <div className="field is-grouped">
        <div className="control">
          <button
            type="submit"
            className={classNames(
              'button is-link',
              {
                'is-loading': loaded,
              },
            )}
          >
            Add
          </button>
        </div>

        <div className="control">
          {/* eslint-disable-next-line react/button-has-type */}
          <button
            type="reset"
            className="button is-link is-light"
            onClick={handleClearForm}
          >
            Clear
          </button>
        </div>
      </div>
    </form>
  );
};