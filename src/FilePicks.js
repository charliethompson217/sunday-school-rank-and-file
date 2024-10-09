import React from 'react';
import QuestionWithTwoButtons from './QuestionWithTwoButtons';

export default function FilePicks({ fileMatchups, filePicks, onFilePicksChange }) {
  return (
    <div>
      <h3>File Picks</h3>
      <p>Now you will make your file picks</p>
      {fileMatchups.map((data, index) => (
        <QuestionWithTwoButtons
          key={index}
          question={`${data[0]} @ ${data[1]}`}
          description={data[2]}
          label1={data[0]}
          label2={data[1]}
          answer={filePicks[index].value}
          onInputChange={(value) => onFilePicksChange(index, value)}
        />
      ))}
    </div>
  );
};