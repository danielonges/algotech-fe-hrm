import ReactQuill from 'react-quill';
import 'quill-divider';
// import 'react-quill/dist/quill.snow.css';
import '../styles/editor/editor.scss';

const toolbarOptions = [
  //   [{ font: ['sans-serif', 'serif'] }],
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ align: [] }],
  ['bold', 'italic', 'underline', 'strike'], // toggled buttons
  ['blockquote', 'divider'],

  // [{ header: 1 }, { header: 2 }], // custom button values
  [{ list: 'ordered' }, { list: 'bullet' }],
  //   [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
  [{ indent: '-1' }, { indent: '+1' }], // outdent/indent

  [{ color: [] }, { background: [] }], // dropdown with defaults from theme,
  ['image'],

  ['clean'] // remove formatting button
];

type TextEditorProps = {
  content?: string;
  updateContent: (content: string) => void;
  onBlur?: () => void;
  className?: string;
  style?: React.CSSProperties;
};

const TextEditor = ({
  content = '',
  updateContent,
  onBlur,
  className = '',
  style = {}
}: TextEditorProps) => {
  //   const [content, setContent] = React.useState<string>('');
  return (
    <div className={className} style={style}>
      <ReactQuill
        theme='snow'
        value={content}
        onChange={(value) => {
          updateContent(value);
        }}
        onBlur={onBlur}
        modules={{ toolbar: toolbarOptions, divider: true }}
        style={{ height: '40vh' }}
        placeholder='Enter content here...'
      />
    </div>
  );
};

export default TextEditor;
