import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  icon: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Declarative forms',
    icon: '🧩',
    description: (
      <>
        Describe inputs, dropdowns, dates, files and buttons as nodes in a <code>FormStructure</code>.
        The library renders the Angular Material fields and creates the reactive form for you.
      </>
    ),
  },
  {
    title: 'Dynamic at runtime',
    icon: '⚡',
    description: (
      <>
        Add or remove nodes, patch values, change validators and react to events while the form is on screen,
        using the same <code>FormStructure</code> instance.
      </>
    ),
  },
  {
    title: 'Your app, your setup',
    icon: '🎛️',
    description: (
      <>
        Since 1.7.0 the library ships no app-level modules: you choose the animations module and it works in
        lazy-loaded modules. Every component is covered by specs.
      </>
    ),
  },
];

function Feature({title, icon, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <span className={styles.featureIcon} role="img" aria-hidden="true">{icon}</span>
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
