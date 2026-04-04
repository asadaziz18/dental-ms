import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { ManualBlock } from './parse-manual-md';

const styles = StyleSheet.create({
  page: { padding: 44, fontSize: 10, fontFamily: 'Helvetica' },
  title: { fontSize: 18, marginBottom: 14, fontWeight: 'bold' },
  h2: { fontSize: 13, marginTop: 12, marginBottom: 6, fontWeight: 'bold' },
  h3: { fontSize: 11, marginTop: 8, marginBottom: 4, fontWeight: 'bold' },
  p: { marginBottom: 6, lineHeight: 1.45 },
  bullet: { marginBottom: 3, marginLeft: 12, lineHeight: 1.4 },
  hr: { borderBottomWidth: 0.5, borderBottomColor: '#999', marginVertical: 8 },
  footer: { position: 'absolute', bottom: 28, left: 44, right: 44, fontSize: 8, color: '#666' },
});

function BlockView({ block }: { block: ManualBlock }) {
  switch (block.type) {
    case 'title':
      return <Text style={styles.title}>{block.text}</Text>;
    case 'h2':
      return <Text style={styles.h2}>{block.text}</Text>;
    case 'h3':
      return <Text style={styles.h3}>{block.text}</Text>;
    case 'p':
      return <Text style={styles.p}>{block.text}</Text>;
    case 'bullet':
      return (
        <Text style={styles.bullet}>
          • {block.text}
        </Text>
      );
    case 'hr':
      return <View style={styles.hr} />;
    default:
      return null;
  }
}

export function UserManualPdfDocument({ blocks }: { blocks: ManualBlock[] }) {
  return (
    <Document title="Dental MS User Manual" author="Dental MS">
      <Page size="A4" style={styles.page} wrap>
        <View wrap>
          {blocks.map((block, index) => (
            <BlockView key={index} block={block} />
          ))}
        </View>
        <Text
          style={styles.footer}
          fixed
          render={({ pageNumber, totalPages }) =>
            `Dental MS User Manual — Page ${pageNumber} of ${totalPages}`
          }
        />
      </Page>
    </Document>
  );
}
