import React from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Text, Surface } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { FileText } from 'lucide-react-native';
import theme from '../../theme/theme';

const { width } = Dimensions.get('window');

const ExamsScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Surface style={styles.emptyCard}>
          <FileText size={64} color="#e0e7ff" />
          <Text style={styles.title}>No Exams Scheduled</Text>
          <Text style={styles.subtitle}>
            Your upcoming exam schedule will appear here once published by the
            department.
          </Text>
        </Surface>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    padding: 40,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    width: width - 40,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default ExamsScreen;
